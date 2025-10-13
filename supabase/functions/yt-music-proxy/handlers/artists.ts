import { corsHeaders, ytmusic, formatArtist } from '../utils.ts';

export async function handleArtists(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const query = requestBody.query;
  console.log(`[yt-music-proxy] Fetching artists for query: "${query || 'popular artists'}"`);

  let artistResults: any[] = [];
  if (query) {
    const searchRes = await ytmusic.search(query, 'artists');
    artistResults = searchRes;
  } else {
    const popularArtists = await ytmusic.search('popular artists', 'artists');
    artistResults = popularArtists;
  }

  const formattedArtists = artistResults.map((item: any) => formatArtist(item));

  return new Response(JSON.stringify({ artists: formattedArtists }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}