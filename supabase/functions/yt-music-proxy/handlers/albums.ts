import { corsHeaders, ytmusic, formatAlbum } from '../utils.ts';

export async function handleAlbums(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const query = requestBody.query;
  console.log(`[yt-music-proxy] Fetching albums for query: "${query || 'popular albums'}"`);

  let albumResults: any[] = [];
  if (query) {
    const searchRes = await ytmusic.search(query, 'albums');
    albumResults = searchRes;
  } else {
    const popularAlbums = await ytmusic.search('popular albums', 'albums');
    albumResults = popularAlbums;
  }

  const formattedAlbums = albumResults.map((item: any) => formatAlbum(item)).filter(Boolean);
  console.log(`[yt-music-proxy] Formatted album results count: ${formattedAlbums.length}`);

  return new Response(JSON.stringify({ albums: formattedAlbums }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}