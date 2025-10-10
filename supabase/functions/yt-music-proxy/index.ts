import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import YouTubeMusic from 'npm:ytmusic-api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ytmusic = new YouTubeMusic();
let isInitialized = false;

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
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const albumId = item.albumId; // YouTube Music specific album ID

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
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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
      console.log(`[yt-music-proxy] Fetching tracks for albumId: "${albumId}"`);

      if (!albumId || albumId === 'undefined') { // Added check for 'undefined' string
        console.error('[yt-music-proxy] Missing or invalid albumId for /album-tracks');
        return new Response(JSON.stringify({ error: 'Missing or invalid albumId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let albumInfo;
      try {
        albumInfo = await ytmusic.getAlbum(albumId);
        console.log(`[yt-music-proxy] Raw albumInfo for ${albumId}:`, JSON.stringify(albumInfo, null, 2));
      } catch (ytError) {
        console.error(`[yt-music-proxy] Error fetching album ${albumId}:`, ytError.message);
        return new Response(JSON.stringify({ error: `Album not found or inaccessible: ${ytError.message}` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const albumTracks = albumInfo.tracks || [];
      console.log(`[yt-music-proxy] Raw albumTracks count for ${albumId}: ${albumTracks.length}`);
      console.log(`[yt-music-proxy] First 3 raw albumTracks for ${albumId}:`, JSON.stringify(albumTracks.slice(0, 3), null, 2));

      const albumThumbnail = albumInfo.thumbnails && albumInfo.thumbnails.length > 0 ? albumInfo.thumbnails[albumInfo.thumbnails.length - 1].url : undefined;

      const formattedTracks = albumTracks.map((item: any) => {
        const videoId = item.videoId;
        console.log(`[yt-music-proxy] Album track "${item.title}" videoId: ${videoId}`); // Added log
        if (!videoId) { // Only include tracks that have a videoId
          console.log(`[yt-music-proxy] Skipping album track "${item.title}" due to missing videoId.`);
          return null; // Return null for unplayable tracks
        }
        const title = item.title || item.name || 'Unknown Title';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        } else if (albumInfo.artist) { // Fallback to album's artist if track artist is missing
            if (typeof albumInfo.artist === 'object' && albumInfo.artist !== null && albumInfo.artist.name) {
                artist = albumInfo.artist.name;
            } else if (typeof albumInfo.artist === 'string') {
                artist = albumInfo.artist;
            }
        }
        const album = albumInfo.title; // Use the album title from getAlbum response
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : albumThumbnail; // Use track thumbnail or album thumbnail
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
      console.log(`[yt-music-proxy] Formatted album tracks count for ${albumId}: ${formattedTracks.length}`);

      return new Response(JSON.stringify({ 
        tracks: formattedTracks, 
        albumTitle: albumInfo.title, 
        albumArtist: albumInfo.artist,
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
      console.log(`[yt-music-proxy] Fetching tracks for artistId: "${artistId}"`);

      if (!artistId || artistId === 'undefined') { // Added check for 'undefined' string
        return new Response(JSON.stringify({ error: 'Missing or invalid artistId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let artistInfo;
      try {
        artistInfo = await ytmusic.getArtist(artistId);
      } catch (ytError) {
        console.error(`[yt-music-proxy] Error fetching artist ${artistId}:`, ytError.message);
        return new Response(JSON.stringify({ error: `Artist not found or inaccessible: ${ytError.message}` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const topSongs = artistInfo.topSongs || [];

      const formattedTracks = topSongs.map((item: any) => {
        const videoId = item.videoId;
        if (!videoId) { // Only include tracks that have a videoId
          console.log(`[yt-music-proxy] Skipping artist track "${item.title}" due to missing videoId.`);
          return null; // Return null for unplayable tracks
        }
        const title = item.title || item.name || 'Unknown Title';
        let artist = artistInfo.name || 'Unknown Artist'; // Use artistInfo.name for consistency
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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

      return new Response(JSON.stringify({
        artistName: artistInfo.name,
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
      const query = requestBody.query; // Allow custom query, default to 'popular albums'
      console.log(`[yt-music-proxy] Fetching albums for query: "${query || 'popular albums'}"`);

      let albumResults: any[] = [];
      if (query) {
        const searchRes = await ytmusic.search(query, 'albums');
        albumResults = searchRes;
      } else {
        const popularAlbums = await ytmusic.search('popular albums', 'albums'); // Default to popular albums
        albumResults = popularAlbums;
      }

      const formattedAlbums = albumResults.map((item: any) => {
        const title = item.title || item.name || 'Unknown Album';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        }
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const albumId = item.albumId;

        return {
          type: 'album',
          title,
          artist,
          thumbnail,
          albumId,
        };
      }).filter(album => album.albumId); // Filter out any items that genuinely don't have an albumId

      console.log(`[yt-music-proxy] Formatted album results count: ${formattedAlbums.length}`);

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
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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
        const trendingPlaylists = await ytmusic.search('trending playlists', 'playlists'); // Default to trending playlists
        playlistResults = trendingPlaylists;
      }

      const formattedPlaylists = playlistResults.map((item: any) => {
        const name = item.title || item.name || 'Unknown Playlist';
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
        const playlistId = item.playlistId; // YouTube Music specific playlist ID
        const trackCount = item.itemCount || 0; // Number of tracks in playlist

        return {
          type: 'playlist',
          name,
          thumbnail,
          playlistId,
          trackCount,
        };
      });

      return new Response(JSON.stringify({ playlists: formattedPlaylists }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching playlist tracks
    if (pathname.endsWith('/playlist-tracks')) {
      const requestBody = await req.json();
      const { playlistId } = requestBody;
      console.log(`[yt-music-proxy] Fetching tracks for playlistId: "${playlistId}"`);

      if (!playlistId || playlistId === 'undefined') { // Added check for 'undefined' string
        console.error('[yt-music-proxy] Missing or invalid playlistId for /playlist-tracks');
        return new Response(JSON.stringify({ error: 'Missing or invalid playlistId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let playlistInfo;
      try {
        playlistInfo = await ytmusic.getPlaylist(playlistId);
        console.log(`[yt-music-proxy] Raw playlistInfo for ${playlistId}:`, JSON.stringify(playlistInfo, null, 2));
      } catch (ytError) {
        console.error(`[yt-music-proxy] Error fetching playlist ${playlistId}:`, ytError.message);
        return new Response(JSON.stringify({ error: `Playlist not found or inaccessible: ${ytError.message}` }), {
          status: 404, // Return 404 if playlist is not found or inaccessible
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const playlistTracks = playlistInfo.tracks || [];
      console.log(`[yt-music-proxy] Raw playlistTracks count for ${playlistId}: ${playlistTracks.length}`);
      console.log(`[yt-music-proxy] First 3 raw playlistTracks for ${playlistId}:`, JSON.stringify(playlistTracks.slice(0, 3), null, 2));

      const playlistThumbnail = playlistInfo.thumbnails && playlistInfo.thumbnails.length > 0 ? playlistInfo.thumbnails[playlistInfo.thumbnails.length - 1].url : undefined;


      const formattedTracks = playlistTracks.map((item: any) => {
        const videoId = item.videoId;
        console.log(`[yt-music-proxy] Playlist track "${item.title}" videoId: ${videoId}`); // Added log
        if (!videoId) {
          console.log(`[yt-music-proxy] Skipping playlist track "${item.title}" due to missing videoId.`);
          return null;
        }
        const title = item.title || item.name || 'Unknown Title';
        let artist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          artist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            artist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            artist = item.artist;
          }
        } else if (playlistInfo.author) { // Fallback to playlist's author if track artist is missing
            if (typeof playlistInfo.author === 'object' && playlistInfo.author !== null && playlistInfo.author.name) {
                artist = playlistInfo.author.name;
            } else if (typeof playlistInfo.author === 'string') {
                artist = playlistInfo.author;
            }
        }
        const album = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : playlistThumbnail; // Use track thumbnail or playlist thumbnail
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
      }).filter(Boolean);

      return new Response(JSON.stringify({
        tracks: formattedTracks,
        playlistName: playlistInfo.title,
        playlistThumbnail: playlistThumbnail, // Explicitly return playlist thumbnail
        trackCount: playlistInfo.itemCount || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // NEW: Endpoint for fetching related tracks
    if (pathname.endsWith('/related-tracks')) {
      const requestBody = await req.json();
      const { videoId, artist, album } = requestBody;
      console.log(`[yt-music-proxy] Fetching related tracks for videoId: "${videoId}", artist: "${artist}", album: "${album}"`);

      let relatedResults: any[] = [];

      if (videoId) {
        // Prioritize fetching related songs by videoId
        const relatedSongs = await ytmusic.getRelatedSongs(videoId);
        relatedResults = relatedSongs.results || [];
      } else if (artist || album) {
        // Fallback to searching if no videoId, combine artist and album for better results
        const searchQuery = `${artist || ''} ${album || ''} songs`.trim();
        if (searchQuery) {
          const searchRes = await ytmusic.search(searchQuery, 'songs');
          relatedResults = searchRes;
        }
      }

      const formattedTracks = relatedResults.map((item: any) => {
        const trackVideoId = item.videoId;
        if (!trackVideoId) {
          console.log(`[yt-music-proxy] Skipping related track "${item.title}" due to missing videoId.`);
          return null;
        }
        const title = item.title || item.name || 'Unknown Title';
        let trackArtist = 'Unknown Artist';
        if (item.artists && item.artists.length > 0 && item.artists[0].name) {
          trackArtist = item.artists[0].name;
        } else if (item.artist) {
          if (typeof item.artist === 'object' && item.artist !== null && item.artist.name) {
            trackArtist = item.artist.name;
          } else if (typeof item.artist === 'string') {
            trackArtist = item.artist;
          }
        }
        const trackAlbum = item.album ? item.album.name : undefined;
        const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
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

      return new Response(JSON.stringify({ relatedTracks: formattedTracks }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }


    console.log(`[yt-music-proxy] Path not found: ${pathname}`);
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[yt-music-proxy] Error:', error.message);
    console.error('[yt-music-proxy] Stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});