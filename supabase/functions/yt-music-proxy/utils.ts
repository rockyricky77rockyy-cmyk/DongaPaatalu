import YouTubeMusic from 'npm:ytmusic-api';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const ytmusic = new YouTubeMusic();
let isInitialized = false;

export async function initializeYtmusic() {
  if (!isInitialized) {
    await ytmusic.initialize();
    isInitialized = true;
    console.log('[yt-music-proxy] YouTubeMusic API initialized.');
  }
}

// Helper to format track data consistently
export function formatTrack(item: any, fallbackArtist?: string, fallbackAlbumTitle?: string, fallbackThumbnail?: string) {
  const videoId = item.videoId;
  if (!videoId) {
    console.log(`[yt-music-proxy] Skipping track "${item.title}" due to missing videoId.`);
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
  } else if (fallbackArtist) {
    artist = fallbackArtist;
  }
  const album = item.album ? item.album.name : fallbackAlbumTitle;
  const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : fallbackThumbnail;
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
}

// Helper to format album data consistently
export function formatAlbum(item: any) {
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
}

// Helper to format artist data consistently
export function formatArtist(item: any) {
  const name = item.title || item.name || 'Unknown Artist';
  const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
  const artistId = item.artistId;

  return {
    type: 'artist',
    name,
    thumbnail,
    artistId,
    genre: 'Various', // Default genre for search results
  };
}

// Helper to format playlist data consistently
export function formatPlaylist(item: any) {
  const name = item.title || item.name || 'Unknown Playlist';
  const thumbnail = item.thumbnails && item.thumbnails.length > 0 ? item.thumbnails[item.thumbnails.length - 1].url : undefined;
  const playlistId = item.playlistId;

  if (!playlistId) {
    console.warn(`[yt-music-proxy] Skipping playlist "${name}" due to missing playlistId.`);
    return null;
  }

  return {
    type: 'playlist',
    name,
    thumbnail,
    playlistId,
  };
}