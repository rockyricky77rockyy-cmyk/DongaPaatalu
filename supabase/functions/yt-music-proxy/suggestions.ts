import { corsHeaders, ytmusic } from './utils.ts';

export async function handleSuggestions(req: Request): Promise<Response> {
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