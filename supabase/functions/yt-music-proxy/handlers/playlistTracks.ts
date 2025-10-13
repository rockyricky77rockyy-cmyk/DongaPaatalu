import { corsHeaders, ytmusic, formatTrack } from '../utils.ts';

export async function handlePlaylistTracks(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const { playlistId } = requestBody;
  console.log(`[yt-music-proxy] Received playlistId for /playlist-tracks: "${playlistId}"`);

  if (!playlistId || playlistId === 'undefined') {
    console.error('[yt-music-proxy] Missing or invalid playlistId for /playlist-tracks');
    return new Response(JSON.stringify({ error: 'Missing or invalid playlistId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let playlistInfo;
  try {
    console.log(`[yt-music-proxy] Calling ytmusic.getPlaylist with ID: "${playlistId}"`);
    playlistInfo = await ytmusic.getPlaylist(playlistId);
    console.log(`[yt-music-proxy] Raw playlistInfo for ${playlistId}:`, JSON.stringify(playlistInfo, null, 2));
  } catch (ytError: any) {
    console.error(`[yt-music-proxy] Error fetching playlist ${playlistId}:`, ytError.message);
    let statusCode = 500;
    let errorMessage = `Error fetching playlist: ${ytError.message}`;

    if (typeof ytError.message === 'string' && ytError.message.includes('status code')) {
      const match = ytError.message.match(/status code (\d{3})/);
      if (match && match[1]) {
        statusCode = parseInt(match[1], 10);
      }
    } else if (ytError.statusCode) {
        statusCode = ytError.statusCode;
    }

    if (statusCode === 400) {
        errorMessage = `Invalid playlist ID or bad request: ${ytError.message}`;
    } else if (statusCode === 404) {
        errorMessage = `Playlist not found or inaccessible: ${ytError.message}`;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const playlistTracks = playlistInfo.tracks || [];
  const playlistThumbnail = playlistInfo.thumbnails && playlistInfo.thumbnails.length > 0 ? playlistInfo.thumbnails[playlistInfo.thumbnails.length - 1].url : undefined;
  const playlistAuthorName = (typeof playlistInfo.author === 'object' && playlistInfo.author !== null && playlistInfo.author.name) ? playlistInfo.author.name : (typeof playlistInfo.author === 'string' ? playlistInfo.author : undefined);

  const formattedTracks = playlistTracks.map((item: any) => formatTrack(item, playlistAuthorName, undefined, playlistThumbnail)).filter(Boolean);

  return new Response(JSON.stringify({
    tracks: formattedTracks,
    playlistName: playlistInfo.title,
    playlistThumbnail: playlistThumbnail,
    trackCount: playlistInfo.itemCount || 0,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}