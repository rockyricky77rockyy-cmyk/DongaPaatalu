import { corsHeaders, ytmusic, formatPlaylist } from './utils.ts';

export async function handlePlaylists(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const query = requestBody.query;
  console.log(`[yt-music-proxy] Fetching trending playlists for query: "${query || 'trending playlists'}"`);
  
  let playlistResults: any[] = [];
  if (query) {
    const searchRes = await ytmusic.search(query, 'playlists');
    playlistResults = searchRes;
  } else {
    const trendingPlaylists = await ytmusic.search('popular playlists', 'playlists');
    playlistResults = trendingPlaylists;
  }

  const formattedPlaylists = playlistResults.map((item: any) => formatPlaylist(item)).filter(Boolean);
  console.log(`[yt-music-proxy] Formatted playlist results count: ${formattedPlaylists.length}`);

  return new Response(JSON.stringify({ playlists: formattedPlaylists }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}