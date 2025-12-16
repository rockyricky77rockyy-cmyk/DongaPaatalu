import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import YouTubeMusic from 'npm:ytmusic-api@5.3.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'; // Import Supabase client for DB interaction

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ytmusic = new YouTubeMusic();
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Initialize Supabase client for database interaction within the Edge Function
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Rate limit configuration
const RATE_LIMITS = {
  '/search': { limit: 30, windowMinutes: 1 },
  '/suggestions': { limit: 40, windowMinutes: 1 },
  '/lyrics': { limit: 10, windowMinutes: 1 },
  '/stream-audio': { limit: 8, windowMinutes: 1 }, // Only counts initial stream request
};

const MAX_CHUNK_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

// Helper function to safely extract artist name
function getArtistName(artistData: any): string {
  if (typeof artistData === 'string') {
    return artistData;
  }
  if (typeof artistData === 'object' && artistData !== null && artistData.name) {
    return artistData.name;
  }
  if (Array.isArray(artistData) && artistData.length > 0 && artistData[0].name) {
    return artistData[0].name;
  }
  return 'Unknown Artist';
}

// Helper to get the best thumbnail and log its details
function getBestThumbnail(thumbnails: any[], context: string): { url?: string; width?: number; height?: number; } {
  if (!thumbnails || thumbnails.length === 0) {
    return {};
  }

  // Find the largest thumbnail available from the provided array
  let bestThumbnail = thumbnails[0];
  for (const thumb of thumbnails) {
    if (thumb.width > bestThumbnail.width) {
      bestThumbnail = thumb;
    }
  }

  let finalUrl = bestThumbnail.url;
  let finalWidth = bestThumbnail.width;
  let finalHeight = bestThumbnail.height;

  // Attempt to get a higher resolution if the current best is too small
  // This pattern is common for Google-hosted images (lh3.googleusercontent.com)
  if (finalUrl && finalWidth < 400) { // If width is less than 400px, try to get a larger one
    const match = finalUrl.match(/=w(\d+)-h(\d+)/);
    if (match) {
      const currentWidth = parseInt(match[1]);
      const currentHeight = parseInt(match[2]);
      const targetSize = 500; // Aim for 500x500 or similar

      // Only replace if the current size is smaller than our target
      if (currentWidth < targetSize || currentHeight < targetSize) {
        const newUrl = finalUrl.replace(/=w(\d+)-h(\d+)/, `=w${targetSize}-h${targetSize}`);
        console.log(`[yt-music-proxy] ${context} - Attempting to upgrade thumbnail from ${currentWidth}x${currentHeight} to ${targetSize}x${targetSize}. New URL: ${newUrl}`);
        finalUrl = newUrl;
        finalWidth = targetSize; // Optimistically update dimensions
        finalHeight = targetSize;
      }
    } else if (finalUrl.includes('ytimg.com')) {
      // For youtube.com/ytimg.com URLs, try replacing 'default.jpg' or 'hqdefault.jpg' with 'maxresdefault.jpg'
      if (finalUrl.includes('default.jpg') || finalUrl.includes('hqdefault.jpg')) {
        const newUrl = finalUrl.replace(/(default|hqdefault)\.jpg/, 'maxresdefault.jpg');
        console.log(`[yt-music-proxy] ${context} - Attempting to upgrade ytimg thumbnail. New URL: ${newUrl}`);
        finalUrl = newUrl;
        // We don't know the exact new dimensions, but maxresdefault is usually 1280x720 or 1920x1080
        finalWidth = 1280; 
        finalHeight = 720;
      }
    }
  }

  console.log(`[yt-music-proxy] ${context} final thumbnail: ${finalUrl} (${finalWidth}x${finalHeight})`);
  return { url: finalUrl, width: finalWidth, height: finalHeight };
}

// Helper function to generate unique placeholder lyrics
function generatePlaceholderLyrics(title: string, artist: string): string {
  const lines = [
    `This is a placeholder lyric for "${title}" by ${artist}.`,
    `A simple verse generated for you.`,
    `Music flows, the spirit grows.`,
    `Listen close, let your heart compose.`,
    `Every beat, a sweet retreat.`,
    `Life's a song, where we all belong.`,
    `Enjoy the rhythm!`,
  ];
  return lines.join('\n');
}

async function ensureInitialized() {
  if (isInitialized) {
    return;
  }
  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise = (async () => {
    try {
      console.log('[yt-music-proxy] Attempting to initialize YouTubeMusic API...');
      await ytmusic.initialize();
      isInitialized = true;
      console.log('[yt-music-proxy] YouTubeMusic API initialized successfully.');
    } catch (error) {
      console.error('[yt-music-proxy] Error initializing YouTubeMusic API:', error.message);
      isInitialized = false; // Ensure it can be retried
      throw error; // Re-throw to propagate the error
    } finally {
      initializationPromise = null; // Clear the promise after it settles
    }
  })();
  await initializationPromise;
}

async function checkRateLimit(ip: string, endpoint: string, isRangeRequest: boolean = false): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS];
  if (!config) {
    return { allowed: true }; // No rate limit configured for this endpoint
  }

  const { limit, windowMinutes } = config;
  const windowMs = windowMinutes * 60 * 1000;
  const now = new Date();

  // For stream-audio, only count the first request (not range requests)
  if (endpoint === '/stream-audio' && isRangeRequest) {
    return { allowed: true };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .eq('endpoint', endpoint)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error(`[yt-music-proxy] Rate limit DB error: ${error.message}`);
      // In case of DB error, allow the request to proceed to avoid blocking legitimate users
      return { allowed: true };
    }

    if (data) {
      const windowStart = new Date(data.window_start);
      if (now.getTime() - windowStart.getTime() < windowMs) {
        // Within the current window
        if (data.count < limit) {
          await supabaseAdmin
            .from('rate_limits')
            .update({ count: data.count + 1, last_accessed: now.toISOString() })
            .eq('ip', ip)
            .eq('endpoint', endpoint);
          return { allowed: true };
        } else {
          const retryAfter = Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 1000);
          return { allowed: false, retryAfter };
        }
      } else {
        // Window has passed, reset count
        await supabaseAdmin
          .from('rate_limits')
          .update({ count: 1, window_start: now.toISOString(), last_accessed: now.toISOString() })
          .eq('ip', ip)
          .eq('endpoint', endpoint);
        return { allowed: true };
      }
    } else {
      // First request for this IP and endpoint
      await supabaseAdmin
        .from('rate_limits')
        .insert({ ip, endpoint, count: 1, window_start: now.toISOString(), last_accessed: now.toISOString() });
      return { allowed: true };
    }
  } catch (e: any) {
    console.error(`[yt-music-proxy] Unexpected error in checkRateLimit: ${e.message}`);
    // Default to allowing the request if there's an unexpected error
    return { allowed: true };
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add a global timeout for the entire request handler
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Edge Function timed out')), 28000) // 28 seconds, slightly less than 30s hard limit
  );

  try {
    const response = await Promise.race([
      (async () => {
        const url = new URL(req.url);
        const pathname = url.pathname;
        console.log(`[yt-music-proxy] Request received for: ${pathname}`);

        // Extract client IP
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
        const endpoint = pathname.split('/').pop(); // Get the last part of the path as endpoint name

        // Check rate limit for all relevant endpoints
        if (endpoint && RATE_LIMITS[`/${endpoint}` as keyof typeof RATE_LIMITS]) {
          const isRangeRequest = req.headers.has('Range');
          const rateLimitResult = await checkRateLimit(clientIp, `/${endpoint}`, isRangeRequest);

          if (!rateLimitResult.allowed) {
            console.warn(`[yt-music-proxy] Rate limit exceeded for IP: ${clientIp}, Endpoint: /${endpoint}`);
            return new Response(JSON.stringify({ error: 'Too Many Requests', message: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.` }), {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
              },
            });
          }
        }

        await ensureInitialized(); // Ensure API is initialized

        if (pathname.endsWith('/search')) {
          const requestBody = await req.json();
          const query = requestBody.query;
          console.log(`[yt-music-proxy] Search query: "${query}"`);

          if (!query) {
            console.log('[yt-music-proxy] Missing search query');
            return new Response(JSON.stringify({ error: 'Missing search query' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const [songResults, albumResults, artistResults] = await Promise.all([
            ytmusic.search(query, 'songs'),
            ytmusic.search(query, 'albums'),
            ytmusic.search(query, 'artists'), // Fetch artist results
          ]);

          const formattedResults: any[] = [];

          // Process song results
          songResults.forEach((item: any) => {
            const videoId = item.videoId;
            if (!videoId) { // Only include tracks that have a videoId
              console.log(`[yt-music-proxy] Skipping track "${item.title}" due to missing videoId.`);
              return;
            }
            const title = item.title || item.name || 'Unknown Title';
            const artist = getArtistName(item.artists || item.artist);
            const album = item.album ? item.album.name : undefined;
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Search result track "${title}"`);
            const duration = item.duration;

            formattedResults.push({
              type: 'track',
              title,
              artist,
              album,
              thumbnail,
              videoId,
              duration,
            });
          });

          // Process album results
          albumResults.forEach((item: any) => {
            const title = item.title || item.name || 'Unknown Album';
            const artist = getArtistName(item.artists || item.artist);
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Search result album "${title}"`);
            const albumId = item.albumId; // YouTube Music specific album ID

            if (!albumId) {
              console.warn(`[yt-music-proxy] Skipping album "${title}" due to missing albumId in search results.`);
              return;
            }

            formattedResults.push({
              type: 'album',
              title,
              artist,
              thumbnail,
              albumId,
            });
          });

          // Process artist results
          artistResults.forEach((item: any) => {
            const name = item.title || item.name || 'Unknown Artist';
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Search result artist "${name}"`);
            const artistId = item.artistId;

            formattedResults.push({
              type: 'artist',
              name,
              thumbnail,
              artistId,
              genre: 'Various', // Default genre for search results
            });
          });


          console.log(`[yt-music-proxy] Processed search results count: ${formattedResults.length}`);

          return new Response(JSON.stringify({ results: formattedResults }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
        // New endpoint for fetching album tracks
        if (pathname.endsWith('/album-tracks')) {
          const requestBody = await req.json();
          const { albumId } = requestBody;
          console.log(`[yt-music-proxy] Fetching tracks for albumId: "${albumId}" (type: ${typeof albumId})`); // Added type log

          // Ensure albumId is a non-empty string
          if (!albumId || typeof albumId !== 'string' || albumId.trim() === '') {
            console.error('[yt-music-proxy] Missing or invalid albumId for /album-tracks');
            return new Response(JSON.stringify({ error: 'Missing or invalid albumId' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          let albumInfo;
          try {
            albumInfo = await ytmusic.getAlbum(albumId);
            console.log(`[yt-music-proxy] RAW albumInfo for ${albumId}:`, JSON.stringify(albumInfo, null, 2)); // Log full raw albumInfo
          } catch (ytError: any) {
            console.error(`[yt-music-proxy] Error fetching album ${albumId}:`, ytError.message);
            return new Response(JSON.stringify({ error: `Album not found or inaccessible: ${ytError.message}` }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const albumTracksRaw = albumInfo.songs || []; 
          console.log(`[yt-music-proxy] RAW albumTracks count for ${albumId}: ${albumTracksRaw.length}`);
          console.log(`[yt-music-proxy] First 5 RAW albumTracks for ${albumId}:`, JSON.stringify(albumTracksRaw.slice(0, 5), null, 2));

          const { url: albumThumbnail } = getBestThumbnail(albumInfo.thumbnails, `Album "${albumInfo.title}"`);

          let formattedTracks = albumTracksRaw.map((item: any) => {
            // Enhanced videoId extraction logic
            let videoId = item.videoId;
            if (!videoId && item.setVideoId) {
              videoId = item.setVideoId;
            }
            if (!videoId && item.playlistSetVideoId) {
              videoId = item.playlistSetVideoId;
            }
            if (!videoId && item.feedbackTokens?.add) {
              videoId = item.feedbackTokens.add;
            }
            if (!videoId && item.feedbackTokens?.remove) {
              videoId = item.feedbackTokens.remove;
            }
            if (!videoId && item.video?.videoId) { // Check for nested video object
              videoId = item.video.videoId;
            }
            // NEW: Check for content.videoId if it's a more complex object
            if (!videoId && item.content?.videoId) {
              videoId = item.content.videoId;
            }


            console.log(`[yt-music-proxy] Processing album track "${item.title}" (extracted videoId: ${videoId})`); // Added log for each item
            if (!videoId) { // Only include tracks that have a videoId
              console.log(`[yt-music-proxy] Skipping album track "${item.title}" due to missing videoId after exhaustive check.`);
              return null; // Return null for unplayable tracks
            }
            const title = item.title || item.name || 'Unknown Title';
            const artist = getArtistName(item.artists || item.artist || albumInfo.artist); // Fallback to album's artist
            const album = albumInfo.title; // Use the album title from getAlbum response
            const { url: trackThumbnailUrl } = getBestThumbnail(item.thumbnails, `Album track "${title}"`);
            const thumbnail = trackThumbnailUrl || albumThumbnail; // Use track thumbnail or album thumbnail
            const duration = item.duration; // Duration might be available

            return {
              type: 'track',
              title,
              artist,
              album,
              thumbnail,
              videoId,
              duration,
            };
          }).filter(Boolean); // Filter out null entries
          console.log(`[yt-music-proxy] Formatted album tracks count from getAlbum for ${albumId}: ${formattedTracks.length}`);

          // Fallback search if no playable tracks found directly from the album
          if (formattedTracks.length === 0 && albumInfo.title && albumInfo.artist) {
            console.log(`[yt-music-proxy] No direct playable tracks found for album "${albumInfo.title}". Attempting fallback search.`);
            const fallbackQuery = `${albumInfo.title} by ${getArtistName(albumInfo.artist)} songs`;
            console.log(`[yt-music-proxy] Fallback search query: "${fallbackQuery}"`);
            const fallbackSearchResults = await ytmusic.search(fallbackQuery, 'songs');
            console.log(`[yt-music-proxy] RAW fallbackSearchResults count: ${fallbackSearchResults.length}`);
            console.log(`[yt-music-proxy] First 5 RAW fallbackSearchResults:`, JSON.stringify(fallbackSearchResults.slice(0, 5), null, 2));


            fallbackSearchResults.forEach((item: any) => {
              const videoId = item.videoId;
              if (!videoId) {
                console.log(`[yt-music-proxy] Skipping fallback track "${item.title}" due to missing videoId.`);
                return;
              }
              const title = item.title || item.name || 'Unknown Title';
              const artist = getArtistName(item.artists || item.artist);
              const album = item.album ? item.album.name : undefined;
              const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Fallback search track "${title}"`);
              const duration = item.duration;

              formattedTracks.push({
                type: 'track',
                title,
                artist,
                album,
                thumbnail,
                videoId,
                duration,
              });
            });
            console.log(`[yt-music-proxy] Total formatted tracks after fallback search: ${formattedTracks.length}`);
          }


          return new Response(JSON.stringify({ 
            tracks: formattedTracks, 
            albumTitle: albumInfo.title, 
            albumArtist: getArtistName(albumInfo.artist), // Use helper for albumArtist
            albumThumbnail: albumThumbnail, // Explicitly return album thumbnail
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching artist details and top tracks
        if (pathname.endsWith('/artist-tracks')) {
          const requestBody = await req.json();
          const { artistId } = requestBody;
          console.log(`[yt-music-proxy] Received artistId for /artist-tracks: "${artistId}" (type: ${typeof artistId})`); // Added log here

          if (!artistId || artistId === 'undefined') { // Added check for 'undefined' string
            console.error('[yt-music-proxy] Missing or invalid artistId for /artist-tracks');
            return new Response(JSON.stringify({ error: 'Missing or invalid artistId' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          let artistInfo;
          try {
            console.log(`[yt-music-proxy] Calling ytmusic.getArtist with ID: "${artistId}"`); // Added log before API call
            artistInfo = await ytmusic.getArtist(artistId);
            console.log(`[yt-music-proxy] Raw artistInfo for ${artistId}:`, JSON.stringify(artistInfo, null, 2)); // Log full raw artistInfo
          } catch (ytError: any) {
            console.error(`[yt-music-proxy] Error fetching artist ${artistId}:`, ytError.message);
            return new Response(JSON.stringify({ error: `Artist not found or inaccessible: ${ytError.message}` }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const topSongs = artistInfo.topSongs || [];
          console.log(`[yt-music-proxy] RAW topSongs count for ${artistId}: ${topSongs.length}`);
          console.log(`[yt-music-proxy] First 3 RAW topSongs for ${artistId}:`, JSON.stringify(topSongs.slice(0, 3), null, 2));


          const formattedTracks = topSongs.map((item: any) => {
            const videoId = item.videoId;
            if (!videoId) { // Only include tracks that have a videoId
              console.log(`[yt-music-proxy] Skipping artist track "${item.title}" due to missing videoId.`);
              return null; // Return null for unplayable tracks
            }
            const title = item.title || item.name || 'Unknown Title';
            const artist = getArtistName(artistInfo.name); // Use helper for artist name
            const album = item.album ? item.album.name : undefined;
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Artist track "${title}"`);
            const duration = item.duration;

            return {
              type: 'track',
              title,
              artist,
              album,
              thumbnail,
              videoId,
              duration,
            };
          }).filter(Boolean); // Filter out null entries
          console.log(`[yt-music-proxy] Formatted artist tracks count for ${artistId}: ${formattedTracks.length}`);


          return new Response(JSON.stringify({
            artistName: getArtistName(artistInfo.name), // Use helper for artistName
            artistThumbnail: artistInfo.thumbnails && artistInfo.thumbnails.length > 0 ? artistInfo.thumbnails[artistInfo.thumbnails.length - 1].url : undefined,
            tracks: formattedTracks
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // New endpoint for fetching search suggestions
        if (pathname.endsWith('/suggestions')) {
          const requestBody = await req.json();
          const query = requestBody.query;
          console.log(`[yt-music-proxy] Fetching suggestions for query: "${query}"`);

          if (!query) {
            return new Response(JSON.stringify({ error: 'Missing query for suggestions' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const suggestions = await ytmusic.getSearchSuggestions(query);
          console.log(`[yt-music-proxy] Suggestions found: ${suggestions.length}`);

          return new Response(JSON.stringify({ suggestions }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // Endpoint for fetching albums (new releases or search)
        if (pathname.endsWith('/albums')) {
          const requestBody = await req.json();
          const clientQuery = requestBody.query; // Allow custom query, default to 'popular albums'
          console.log(`[yt-music-proxy] Fetching albums for client query: "${clientQuery}"`);

          const queriesToExecute = [
            clientQuery || 'popular albums', // Use client's query or default
            'new Telugu albums',
            'top Telugu albums',
            'best Telugu albums',
            'latest Telugu Telugu albums',
          ].filter(q => q); // Filter out any empty queries

          let allAlbumResults: any[] = [];
          const seenAlbumIds = new Set<string>();

          for (const q of queriesToExecute) {
            console.log(`[yt-music-proxy] Executing album search for: "${q}"`);
            try {
              const searchRes = await ytmusic.search(q, 'albums');
              searchRes.forEach((item: any) => {
                if (item.albumId && !seenAlbumIds.has(item.albumId)) {
                  allAlbumResults.push(item);
                  seenAlbumIds.add(item.albumId);
                }
              });
            } catch (error) {
              console.error(`[yt-music-proxy] Error searching for "${q}": ${error.message}`);
            }
          }

          const formattedAlbums = allAlbumResults.map((item: any) => {
            const title = item.title || item.name || 'Unknown Album';
            const artist = getArtistName(item.artists || item.artist);
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Album list item "${title}"`);
            const albumId = item.albumId;

            if (!albumId) {
              console.warn(`[yt-music-proxy] Skipping album "${title}" due to missing albumId.`);
              return null;
            }

            return {
              type: 'album',
              title,
              artist,
              thumbnail,
              albumId,
            };
          }).filter(Boolean);

          console.log(`[yt-music-proxy] Total unique formatted album results count: ${formattedAlbums.length}`);

          return new Response(JSON.stringify({ albums: formattedAlbums }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching artists (simulated browse via search)
        if (pathname.endsWith('/artists')) {
          const requestBody = await req.json();
          const query = requestBody.query; // Allow custom query, default to 'popular artists'
          console.log(`[yt-music-proxy] Fetching artists for query: "${query || 'popular artists'}"`);

          let artistResults: any[] = [];
          if (query) {
            const searchRes = await ytmusic.search(query, 'artists');
            artistResults = searchRes;
          } else {
            const popularArtists = await ytmusic.search('popular artists', 'artists'); // Default to popular artists
            artistResults = popularArtists;
          }

          const formattedArtists = artistResults.map((item: any) => {
            const name = item.title || item.name || 'Unknown Artist';
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Artist list item "${name}"`);
            const artistId = item.artistId; // YouTube Music specific artist ID

            return {
              type: 'artist',
              name,
              thumbnail,
              artistId,
              // Genre is not directly available from this search, can be added if needed from another source
              genre: 'Various', 
            };
          });

          return new Response(JSON.stringify({ artists: formattedArtists }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching playlists (simulated browse via search)
        if (pathname.endsWith('/playlists')) {
          const requestBody = await req.json();
          const query = requestBody.query; // Allow custom query, default to 'trending playlists'
          console.log(`[yt-music-proxy] Fetching trending playlists for query: "${query || 'trending playlists'}"`);
          
          let playlistResults: any[] = [];
          if (query) {
            const searchRes = await ytmusic.search(query, 'playlists');
            playlistResults = searchRes;
          } else {
            const trendingPlaylists = await ytmusic.search('popular playlists', 'playlists'); // Changed to 'popular playlists' for potentially better results
            playlistResults = trendingPlaylists;
          }

          const formattedPlaylists = playlistResults.map((item: any) => {
            const name = item.title || item.name || 'Unknown Playlist';
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Playlist list item "${name}"`);
            const playlistId = item.playlistId; // YouTube Music specific playlist ID
            // Removed trackCount from here as it's not reliably available in search results

            console.log(`[yt-music-proxy] Initial playlist search result: "${name}" (ID: ${playlistId}), raw itemCount: ${item.itemCount || 'N/A'}`); // Added log for initial search

            if (!playlistId) {
              console.warn(`[yt-music-proxy] Skipping playlist "${name}" due to missing playlistId.`);
              return null; // Filter out playlists without a valid ID
            }

            return {
              type: 'playlist',
              name,
              thumbnail,
              playlistId,
            };
          }).filter(Boolean); // Filter out null entries

          console.log(`[yt-music-proxy] Formatted playlist results count: ${formattedPlaylists.length}`);

          return new Response(JSON.stringify({ playlists: formattedPlaylists }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching playlist tracks
        if (pathname.endsWith('/playlist-tracks')) {
          const requestBody = await req.json();
          const { playlistId, playlistName: clientPlaylistName } = requestBody; // Get playlistName from client
          console.log(`[yt-music-proxy] Received playlistId for /playlist-tracks: "${playlistId}" (type: ${typeof playlistId}), clientPlaylistName: "${clientPlaylistName}"`);

          if (!playlistId || typeof playlistId !== 'string' || playlistId.trim() === '' || playlistId === 'undefined') {
            console.error('[yt-music-proxy] Missing or invalid playlistId for /playlist-tracks');
            return new Response(JSON.stringify({ error: 'Missing or invalid playlistId' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          let playlistInfo;
          let formattedTracks: any[] = [];
          let finalPlaylistName = clientPlaylistName || 'Unknown Playlist';
          let finalPlaylistThumbnail: string | undefined = undefined;
          let usedFallback = false;

          try {
            console.log(`[yt-music-proxy] Attempting to call ytmusic.getPlaylist with ID: "${playlistId}"`);
            playlistInfo = await ytmusic.getPlaylist(playlistId);
            console.log(`[yt-music-proxy] Raw playlistInfo for ${playlistId}:`, JSON.stringify(playlistInfo, null, 2));

            const playlistTracksRaw = playlistInfo.tracks || [];
            console.log(`[yt-music-proxy] Raw playlistTracks count for ${playlistId}: ${playlistTracksRaw.length}`);

            finalPlaylistName = playlistInfo.name || clientPlaylistName || 'Unknown Playlist';
            const { url: fetchedPlaylistThumbnail } = getBestThumbnail(playlistInfo.thumbnails, `Playlist "${finalPlaylistName}"`);
            finalPlaylistThumbnail = fetchedPlaylistThumbnail;
            // Removed direct assignment of playlistInfo.videoCount to finalTrackCount here

            formattedTracks = playlistTracksRaw.map((item: any) => {
              let videoId = item.videoId || item.setVideoId || item.playlistSetVideoId || item.feedbackTokens?.add || item.feedbackTokens?.remove || item.video?.videoId || item.content?.videoId;
              if (!videoId) {
                console.log(`[yt-music-proxy] Skipping playlist track "${item.title}" due to missing videoId.`);
                return null;
              }
              const title = item.title || item.name || 'Unknown Title';
              const artist = getArtistName(item.artists || item.artist || playlistInfo.author);
              const album = item.album ? item.album.name : undefined;
              const { url: trackThumbnailUrl } = getBestThumbnail(item.thumbnails, `Playlist track "${title}"`);
              const thumbnail = trackThumbnailUrl || finalPlaylistThumbnail;
              const duration = item.duration;

              return { type: 'track', title, artist, album, thumbnail, videoId, duration };
            }).filter(Boolean);

            console.log(`[yt-music-proxy] Formatted playlist tracks count from getPlaylist for ${playlistId}: ${formattedTracks.length}`);

          } catch (ytError: any) {
            console.error(`[yt-music-proxy] Error fetching playlist ${playlistId} directly:`, ytError.message);
            // If getPlaylist fails, attempt fallback search
            usedFallback = true;
          }

          // Fallback search if no playable tracks found directly from getPlaylist or if getPlaylist failed
          if (formattedTracks.length === 0 && (usedFallback || finalPlaylistName !== 'Unknown Playlist')) {
            console.log(`[yt-music-proxy] No direct playable tracks found for playlist "${finalPlaylistName}". Attempting fallback search.`);
            const fallbackQuery = `${finalPlaylistName} songs`;
            console.log(`[yt-music-proxy] Fallback search query for playlist: "${fallbackQuery}"`);
            const fallbackSearchResults = await ytmusic.search(fallbackQuery, 'songs');
            console.log(`[yt-music-proxy] RAW fallbackSearchResults count for playlist: ${fallbackSearchResults.length}`);

            fallbackSearchResults.forEach((item: any) => {
              const videoId = item.videoId;
              if (!videoId) {
                console.log(`[yt-music-proxy] Skipping fallback track "${item.title}" due to missing videoId.`);
                return;
              }
              const title = item.title || item.name || 'Unknown Title';
              const artist = getArtistName(item.artists || item.artist);
              const album = item.album ? item.album.name : undefined;
              const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Fallback playlist track "${title}"`);
              const duration = item.duration;

              formattedTracks.push({ type: 'track', title, artist, album, thumbnail, videoId, duration });
            });
            console.log(`[yt-music-proxy] Total formatted tracks after playlist fallback search: ${formattedTracks.length}`);
          }

          // Determine final track count based on the actual number of formatted tracks
          const finalTrackCount = formattedTracks.length;

          // If after all attempts, no tracks are found and it wasn't a direct API error, return a specific message
          if (formattedTracks.length === 0 && !usedFallback) { // Only if getPlaylist didn't throw an error, but returned no tracks
            return new Response(JSON.stringify({ error: `No tracks found for playlist "${finalPlaylistName}". It might be empty or private.` }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else if (formattedTracks.length === 0 && usedFallback) { // If getPlaylist failed AND fallback also found no tracks
            return new Response(JSON.stringify({ error: `Could not fetch playlist "${finalPlaylistName}". It might be invalid or no tracks were found.` }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }


          return new Response(JSON.stringify({
            tracks: formattedTracks,
            playlistName: finalPlaylistName,
            playlistThumbnail: finalPlaylistThumbnail,
            trackCount: finalTrackCount,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching related tracks
        if (pathname.endsWith('/related-tracks')) {
          const requestBody = await req.json();
          const { videoId, artist, album } = requestBody;
          console.log(`[yt-music-proxy] RELATED TRACKS REQUEST: videoId="${videoId}", artist="${artist}", album="${album}"`);

          let relatedResults: any[] = [];

          // Ensure videoId is a non-empty string before attempting to use it with getSong
          if (videoId && videoId.trim() !== '') {
            try {
              console.log(`[yt-music-proxy] Attempting ytmusic.getSong(${videoId}) for related tracks.`);
              const songInfo = await ytmusic.getSong(videoId);
              relatedResults = songInfo.related?.results || [];
              console.log(`[yt-music-proxy] ytmusic.getSong(${videoId}) returned ${relatedResults.length} related results.`);
              if (relatedResults.length > 0) {
                console.log(`[yt-music-proxy] First 3 raw related results from getSong:`, JSON.stringify(relatedResults.slice(0, 3), null, 2));
              }
            } catch (error) {
              console.warn(`[yt-music-proxy] Failed to get song info for videoId "${videoId}": ${error.message}. Falling back to search.`);
              // Fallback to search if getSong fails for a valid-looking videoId
              const searchQuery = `${artist || ''} ${album || ''} songs`.trim();
              if (searchQuery) {
                console.log(`[yt-music-proxy] Falling back to search for related tracks with query: "${searchQuery}"`);
                const searchRes = await ytmusic.search(searchQuery, 'songs');
                relatedResults = searchRes;
                console.log(`[yt-music-proxy] Search returned ${relatedResults.length} results.`);
                if (relatedResults.length > 0) {
                  console.log(`[yt-music-proxy] First 3 raw related results from search:`, JSON.stringify(relatedResults.slice(0, 3), null, 2));
                }
              }
            }
          } else if (artist || album) {
            // Fallback to searching if no valid videoId, combine artist and album for better results
            const searchQuery = `${artist || ''} ${album || ''} songs`.trim();
            if (searchQuery) {
              console.log(`[yt-music-proxy] No videoId, searching for related tracks with query: "${searchQuery}"`);
              const searchRes = await ytmusic.search(searchQuery, 'songs');
              relatedResults = searchRes;
              console.log(`[yt-music-proxy] Search returned ${relatedResults.length} results.`);
              if (relatedResults.length > 0) {
                console.log(`[yt-music-proxy] First 3 raw related results from search:`, JSON.stringify(relatedResults.slice(0, 3), null, 2));
              }
            }
          }

          const formattedTracks = relatedResults.map((item: any) => {
            const trackVideoId = item.videoId;
            if (!trackVideoId) {
              console.log(`[yt-music-proxy] Skipping related track "${item.title}" due to missing videoId.`);
              return null;
            }
            const title = item.title || item.name || 'Unknown Title';
            const trackArtist = getArtistName(item.artists || item.artist);
            const trackAlbum = item.album ? item.album.name : undefined;
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Related track "${title}"`);
            const duration = item.duration;

            return {
              type: 'track',
              title,
              artist: trackArtist,
              album: trackAlbum,
              thumbnail,
              videoId: trackVideoId,
              duration,
            };
          }).filter(Boolean);

          console.log(`[yt-music-proxy] Formatted related tracks count: ${formattedTracks.length}`);

          return new Response(JSON.stringify({ relatedTracks: formattedTracks }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching podcasts
        if (pathname.endsWith('/podcasts')) {
          const requestBody = await req.json();
          const query = requestBody.query;
          console.log(`[yt-music-proxy] Fetching podcasts for query: "${query}"`);

          if (!query) {
            return new Response(JSON.stringify({ error: 'Missing query for podcasts' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const podcastResults = await ytmusic.search(query, 'podcasts');
          console.log(`[yt-music-proxy] Raw podcast results count: ${podcastResults.length}`);
          if (podcastResults.length > 0) {
            console.log(`[yt-music-proxy] First 3 raw podcast results:`, JSON.stringify(podcastResults.slice(0, 3), null, 2));
          }

          const formattedPodcasts = podcastResults.map((item: any) => {
            const title = item.title || item.name || 'Unknown Podcast';
            const artist = getArtistName(item.artists || item.artist);
            const { url: thumbnail } = getBestThumbnail(item.thumbnails, `Podcast "${title}"`);
            const podcastId = item.playlistId || item.browseId; // Use playlistId or browseId for podcasts

            if (!podcastId) {
              console.warn(`[yt-music-proxy] Skipping podcast "${title}" due to missing ID.`);
              return null;
            }

            return {
              type: 'podcast',
              title,
              artist,
              thumbnail,
              podcastId,
              description: item.description || '', // Add description if available
            };
          }).filter(Boolean);

          console.log(`[yt-music-proxy] Formatted podcast results count: ${formattedPodcasts.length}`);

          return new Response(JSON.stringify({ podcasts: formattedPodcasts }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Endpoint for fetching actual lyrics
        if (pathname.endsWith('/lyrics')) {
          const requestBody = await req.json();
          const { videoId: clientVideoId, title, artist } = requestBody;
          console.log(`[yt-music-proxy] LYRICS DEBUG: Received videoId: "${clientVideoId}", title: "${title}", artist: "${artist}"`);

          if (!clientVideoId || !title || !artist) {
            console.error('[yt-music-proxy] LYRICS DEBUG: Missing videoId, title, or artist for lyrics');
            return new Response(JSON.stringify({ error: 'Missing videoId, title, or artist for lyrics' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          let lyricsText = ''; // Start with empty string
          let lyricsId: string | undefined;
          let songInfo: any;

          // Attempt 1: Get song info directly with clientVideoId from YouTube Music
          try {
            console.log(`[yt-music-proxy] LYRICS DEBUG: Attempt 1: Calling ytmusic.getSong with clientVideoId: "${clientVideoId}"`);
            songInfo = await ytmusic.getSong(clientVideoId);
            lyricsId = songInfo.lyricsId;
            console.log(`[yt-music-proxy] LYRICS DEBUG: Attempt 1: getSong successful. lyricsId: ${lyricsId}`);
          } catch (error: any) {
            console.warn(`[yt-music-proxy] LYRICS DEBUG: Attempt 1: getSong for "${clientVideoId}" failed: ${error.message}.`);
          }

          // Fallback: If lyricsId not found from getSong, try searching YouTube Music
          if (!lyricsId) {
            console.log(`[yt-music-proxy] LYRICS DEBUG: lyricsId not found from getSong. Attempting fallback search for lyrics on YouTube Music.`);
            try {
              const searchQuery = `${title} ${artist}`;
              const searchResults = await ytmusic.search(searchQuery, 'songs');
              const matchingTrack = searchResults.find((item: any) => {
                if (item.type !== 'SONG' && item.type !== 'VIDEO') return false;
                if (item.videoId === clientVideoId) return true;

                const normalizedItemTitle = (item.title || '').toLowerCase().trim();
                const normalizedClientTitle = (title || '').toLowerCase().trim();
                const normalizedItemArtist = (getArtistName(item.artists || item.artist) || '').toLowerCase().trim();
                const normalizedClientArtist = (artist || '').toLowerCase().trim();

                const titleMatch = normalizedItemTitle.includes(normalizedClientTitle) || normalizedClientTitle.includes(normalizedItemTitle);
                const artistMatch = normalizedItemArtist.includes(normalizedClientArtist) || normalizedClientArtist.includes(normalizedItemArtist);
                return titleMatch && artistMatch;
              });

              if (matchingTrack) {
                if (matchingTrack.lyricsId) {
                  lyricsId = matchingTrack.lyricsId;
                  console.log(`[yt-music-proxy] LYRICS DEBUG: Found lyricsId from fallback search result: ${lyricsId}`);
                } else {
                  console.log(`[yt-music-proxy] LYRICS DEBUG: Matching track found but no lyricsId. Attempting secondary getSong for videoId: ${matchingTrack.videoId}`);
                  try {
                    const secondarySongInfo = await ytmusic.getSong(matchingTrack.videoId);
                    lyricsId = secondarySongInfo.lyricsId;
                    console.log(`[yt-music-proxy] LYRICS DEBUG: Found lyricsId from secondary getSong: ${lyricsId}`);
                  } catch (secondaryError: any) {
                    console.warn(`[yt-music-proxy] LYRICS DEBUG: Secondary getSong for "${matchingTrack.videoId}" failed: ${secondaryError.message}.`);
                  }
                }
              } else {
                console.log(`[yt-music-proxy] LYRICS DEBUG: No matching track found in YouTube Music fallback search for "${searchQuery}".`);
              }
            } catch (searchError: any) {
              console.error(`[yt-music-proxy] LYRICS DEBUG: Fallback search for lyrics failed: ${searchError.message}.`);
            }
          }

          // Attempt 2: Fetch lyrics from YouTube Music if lyricsId is now available
          if (lyricsId) {
            console.log(`[yt-music-proxy] LYRICS DEBUG: Attempt 2: Found lyricsId: ${lyricsId}. Attempting to fetch lyrics from YouTube Music...`);
            try {
              const lyricsResult = await ytmusic.getLyrics(lyricsId);
              lyricsText = lyricsResult.lyrics || '';
              console.log(`[yt-music-proxy] LYRICS DEBUG: Attempt 2: Fetched lyrics from YouTube Music (first 100 chars): ${lyricsText.substring(0, 100)}`);
            } catch (error: any) {
              console.error(`[yt-music-proxy] LYRICS DEBUG: Attempt 2: Error fetching lyrics from YouTube Music for lyricsId "${lyricsId}": ${error.message}.`);
              lyricsText = '';
            }
          }

          // Final fallback to placeholder if no lyrics found from any source
          if (!lyricsText) {
            console.log(`[yt-music-proxy] LYRICS DEBUG: No lyrics found after all attempts for videoId: ${clientVideoId}. Using placeholder lyrics.`);
            lyricsText = generatePlaceholderLyrics(title, artist);
          }

          return new Response(JSON.stringify({ lyrics: lyricsText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        // NEW: Audio Streaming API
        if (pathname.endsWith('/stream-audio')) {
          const videoId = url.searchParams.get('videoId');
          console.log(`[yt-music-proxy] Audio streaming request for videoId: "${videoId}"`);

          if (!videoId) {
            console.error('[yt-music-proxy] Missing videoId for /stream-audio');
            return new Response(JSON.stringify({ error: 'Missing videoId' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          let songInfo;
          try {
            songInfo = await ytmusic.getSong(videoId);
            if (!songInfo || !songInfo.streamingData) {
              console.error(`[yt-music-proxy] No streamingData found for videoId ${videoId}`);
              return new Response(JSON.stringify({ error: 'No streaming data available for this video.' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } catch (error: any) {
            console.error(`[yt-music-proxy] Error getting song info for videoId ${videoId}:`, error.message);
            return new Response(JSON.stringify({ error: `Could not retrieve song information: ${error.message}` }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Find the best audio-only format
          // Prioritize itag 140 (m4a), then itag 251 (opus), then any audio/ format
          const audioFormat = songInfo.streamingData.adaptiveFormats.find((f: any) =>
            f.itag === 140 && f.mimeType.startsWith('audio/mp4')
          ) || songInfo.streamingData.adaptiveFormats.find((f: any) =>
            f.itag === 251 && f.mimeType.startsWith('audio/webm')
          ) || songInfo.streamingData.adaptiveFormats.find((f: any) =>
            f.mimeType.startsWith('audio/')
          );

          if (!audioFormat || !audioFormat.url) {
            console.error(`[yt-music-proxy] No suitable audio format found for videoId ${videoId}`);
            return new Response(JSON.stringify({ error: 'No suitable audio stream found.' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const audioUrl = audioFormat.url;
          const clientRangeHeader = req.headers.get('Range');
          console.log(`[yt-music-proxy] Client Range header: ${clientRangeHeader || 'none'}`);

          // Abuse Protection: Block excessively large byte-range requests
          if (clientRangeHeader) {
            const rangeMatch = clientRangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (rangeMatch) {
              const start = parseInt(rangeMatch[1], 10);
              const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : undefined;
              // Only check if 'end' is defined, meaning a specific range length is requested
              if (end !== undefined && (end - start + 1) > MAX_CHUNK_SIZE_BYTES) {
                console.warn(`[yt-music-proxy] Abusive range request detected for IP: ${clientIp}. Requested chunk size: ${end - start + 1} bytes.`);
                return new Response(JSON.stringify({ error: 'Range Not Satisfiable', message: `Requested byte range exceeds maximum allowed chunk size of ${MAX_CHUNK_SIZE_BYTES / (1024 * 1024)} MB.` }), {
                  status: 416, // Range Not Satisfiable
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
              }
            }
          }

          let headersToForward: HeadersInit = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          };

          if (clientRangeHeader) {
            headersToForward['Range'] = clientRangeHeader;
          } else {
            // Default to bytes=0- if Range header is missing from client request
            headersToForward['Range'] = 'bytes=0-';
            console.log('[yt-music-proxy] Client Range header missing, defaulting to "bytes=0-" for YouTube fetch.');
          }

          const youtubeResponse = await fetch(audioUrl, {
            headers: headersToForward,
          });

          console.log(`[yt-music-proxy] YouTube fetch response status: ${youtubeResponse.status}`);
          console.log(`[yt-music-proxy] YouTube fetch response headers:`, Object.fromEntries(youtubeResponse.headers.entries()));

          // Validate YouTube's response
          if (!youtubeResponse.ok || youtubeResponse.headers.get('Content-Type')?.includes('text/html')) {
            console.error(`[yt-music-proxy] Failed to fetch audio from YouTube: ${youtubeResponse.status} ${youtubeResponse.statusText}. Content-Type: ${youtubeResponse.headers.get('Content-Type')}`);
            let status = 502; // Default to Bad Gateway
            let errorMessage = 'Failed to fetch audio stream from YouTube.';

            if (youtubeResponse.status === 403) {
              errorMessage = 'YouTube blocked access to this audio stream (403 Forbidden).';
            } else if (youtubeResponse.status === 404) {
              errorMessage = 'Audio stream not found on YouTube (404 Not Found).';
              status = 404; // Propagate 404 if YouTube says it's not found
            } else if (youtubeResponse.headers.get('Content-Type')?.includes('text/html')) {
              errorMessage = 'YouTube returned an HTML page instead of an audio stream. Possibly a block or redirect.';
            }
            // For other 4xx or 5xx errors from YouTube, we return 502 Bad Gateway

            return new Response(JSON.stringify({ error: errorMessage }), {
              status: status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const responseHeaders = {
            ...corsHeaders,
            'Content-Type': audioFormat.mimeType.split(';')[0], // Use actual mimeType from YouTube, strip parameters
            'Accept-Ranges': 'bytes',
            ...(youtubeResponse.headers.get('Content-Length') ? { 'Content-Length': youtubeResponse.headers.get('Content-Length')! } : {}),
            ...(youtubeResponse.headers.get('Content-Range') ? { 'Content-Range': youtubeResponse.headers.get('Content-Range')! } : {}),
          };

          return new Response(youtubeResponse.body, {
            status: youtubeResponse.status, // Will be 200 or 206
            headers: responseHeaders,
          });
        }


        console.log(`[yt-music-proxy] Path not found: ${pathname}`);
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      })(),
      timeoutPromise
    ]);
    return response;

  } catch (error: any) {
    console.error('[yt-music-proxy] Global Error (caught by Promise.race):', error.message);
    console.error('[yt-music-proxy] Global Stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});