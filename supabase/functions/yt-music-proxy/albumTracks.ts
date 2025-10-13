import { corsHeaders, ytmusic, formatTrack } from './utils.ts';

export async function handleAlbumTracks(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const { albumId } = requestBody;
  console.log(`[yt-music-proxy] Fetching tracks for albumId: "${albumId}"`);

  if (!albumId || albumId === 'undefined') {
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
  } catch (ytError: any) {
    console.error(`[yt-music-proxy] Error fetching album ${albumId}:`, ytError.message);
    return new Response(JSON.stringify({ error: `Album not found or inaccessible: ${ytError.message}` }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const albumTracks = albumInfo.tracks || [];
  const albumThumbnail = albumInfo.thumbnails && albumInfo.thumbnails.length > 0 ? albumInfo.thumbnails[albumInfo.thumbnails.length - 1].url : undefined;
  const albumArtistName = (typeof albumInfo.artist === 'object' && albumInfo.artist !== null && albumInfo.artist.name) ? albumInfo.artist.name : (typeof albumInfo.artist === 'string' ? albumInfo.artist : 'Unknown Artist');

  const formattedTracks = albumTracks.map((item: any) => formatTrack(item, albumArtistName, albumInfo.title, albumThumbnail)).filter(Boolean);
  console.log(`[yt-music-proxy] Formatted album tracks count for ${albumId}: ${formattedTracks.length}`);

  return new Response(JSON.stringify({ 
    tracks: formattedTracks, 
    albumTitle: albumInfo.title, 
    albumArtist: albumArtistName,
    albumThumbnail: albumThumbnail,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}