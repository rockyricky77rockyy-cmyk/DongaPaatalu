import { corsHeaders, ytmusic, formatTrack } from '../utils.ts';

export async function handleArtistTracks(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const { artistId } = requestBody;
  console.log(`[yt-music-proxy] Fetching tracks for artistId: "${artistId}"`);

  if (!artistId || artistId === 'undefined') {
    return new Response(JSON.stringify({ error: 'Missing or invalid artistId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let artistInfo;
  try {
    artistInfo = await ytmusic.getArtist(artistId);
  } catch (ytError: any) {
    console.error(`[yt-music-proxy] Error fetching artist ${artistId}:`, ytError.message);
    return new Response(JSON.stringify({ error: `Artist not found or inaccessible: ${ytError.message}` }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const topSongs = artistInfo.topSongs || [];
  const artistThumbnail = artistInfo.thumbnails && artistInfo.thumbnails.length > 0 ? artistInfo.thumbnails[artistInfo.thumbnails.length - 1].url : undefined;

  const formattedTracks = topSongs.map((item: any) => formatTrack(item, artistInfo.name, undefined, artistThumbnail)).filter(Boolean);

  return new Response(JSON.stringify({
    artistName: artistInfo.name,
    artistThumbnail: artistThumbnail,
    tracks: formattedTracks
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}