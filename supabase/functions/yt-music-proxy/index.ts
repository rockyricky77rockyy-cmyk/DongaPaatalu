import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import YouTubeMusic from 'npm:ytmusic-api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ytmusic = new YouTubeMusic();
let isInitialized = false;

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
function getBestThumbnail(thumbnails: any[], context: string): { url?: string; width?: number; height?: number } {
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
  ];
  // Use a simple hash to pick a few lines deterministically
  const seedHash = (title.length + artist.length) % lines.length;
  return [
    lines[seedHash],
    lines[(seedHash + 1) % lines.length],
    lines[(seedHash + 2) % lines.length],
    `Enjoy the rhythm!`,
  ].join('\n');
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pathname } = new URL(req.url);
    console.log(`[yt-music-proxy] Request received for: ${pathname}`);

    if (!isInitialized) {
      await ytmusic.initialize();
      isInitialized = true;
      console.log('[yt-music-proxy] YouTubeMusic API initialized.');
    }

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
      try {
        const requestBody = await req.json();
        const { videoId } = requestBody;
        console.log(`[yt-music-proxy] LYRICS: Fetching lyrics for videoId: "${videoId}"`);

        if (!videoId) {
          console.error('[yt-music-proxy] LYRICS: Missing videoId for lyrics');
          return new Response(JSON.stringify({ error: 'Missing videoId for lyrics' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const songInfo = await ytmusic.getSong(videoId);
        console.log(`[yt-music-proxy] LYRICS: Raw songInfo for videoId "${videoId}":`, JSON.stringify(songInfo, null, 2));

        let lyricsText = '';

        if (songInfo && songInfo.lyricsId) {
          console.log(`[yt-music-proxy] LYRICS: Found lyricsId: ${songInfo.lyricsId}. Attempting to fetch lyrics...`);
          const lyricsResult = await ytmusic.getLyrics(songInfo.lyricsId);
          console.log(`[yt-music-proxy] LYRICS: Raw lyricsResult for lyricsId "${songInfo.lyricsId}":`, JSON.stringify(lyricsResult, null, 2));
          lyricsText = lyricsResult.lyrics || 'No lyrics found for this track.';
          console.log(`[yt-music-proxy] LYRICS: Fetched lyrics (first 100 chars): ${lyricsText.substring(0, 100)}`);
        } else {
          lyricsText = 'No lyrics found for this track.';
          console.log(`[yt-music-proxy] LYRICS: No lyricsId found for videoId: ${videoId}.`);
        }

        return new Response(JSON.stringify({ lyrics: lyricsText }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (lyricsError: any) {
        console.error('[yt-music-proxy] LYRICS: Error in /lyrics endpoint:', lyricsError.message);
        console.error('[yt-music-proxy] LYRICS: Stack:', lyricsError.stack);
        return new Response(JSON.stringify({ error: `Internal server error during lyrics fetch: ${lyricsError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`[yt-music-proxy] Path not found: ${pathname}`);
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[yt-music-proxy] Global Error:', error.message);
    console.error('[yt-music-proxy] Global Stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});