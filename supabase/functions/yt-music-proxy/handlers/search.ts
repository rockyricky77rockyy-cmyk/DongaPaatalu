import { corsHeaders, ytmusic, formatTrack, formatAlbum, formatArtist } from '../utils.ts';

export async function handleSearch(req: Request): Promise<Response> {
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
    ytmusic.search(query, 'artists'),
  ]);

  const formattedResults: any[] = [];

  songResults.forEach((item: any) => {
    const formatted = formatTrack(item);
    if (formatted) formattedResults.push(formatted);
  });

  albumResults.forEach((item: any) => {
    const formatted = formatAlbum(item);
    if (formatted) formattedResults.push(formatted);
  });

  artistResults.forEach((item: any) => {
    const formatted = formatArtist(item);
    if (formatted) formattedResults.push(formatted);
  });

  console.log(`[yt-music-proxy] Processed search results count: ${formattedResults.length}`);

  return new Response(JSON.stringify({ results: formattedResults }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}