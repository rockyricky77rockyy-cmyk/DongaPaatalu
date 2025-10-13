import { corsHeaders, ytmusic, formatTrack } from './utils.ts';

export async function handleRelatedTracks(req: Request): Promise<Response> {
  const requestBody = await req.json();
  const { videoId, artist, album } = requestBody;
  console.log(`[yt-music-proxy] Fetching related tracks for videoId: "${videoId}", artist: "${artist}", album: "${album}"`);

  let relatedResults: any[] = [];
  try {
    if (videoId) {
      const relatedSongs = await ytmusic.getRelatedSongs(videoId);
      relatedResults = relatedSongs.results || [];
    } else if (artist || album) {
      const searchQuery = `${artist || ''} ${album || ''} songs`.trim();
      if (searchQuery) {
        const searchRes = await ytmusic.search(searchQuery, 'songs');
        relatedResults = searchRes;
      }
    }
  } catch (ytError: any) {
    console.error(`[yt-music-proxy] Error fetching related tracks for videoId "${videoId}":`, ytError.message);
    // Continue with empty relatedResults, will return 200 with empty array
  }

  const formattedTracks = relatedResults.map((item: any) => formatTrack(item, artist, album)).filter(Boolean);

  return new Response(JSON.stringify({ relatedTracks: formattedTracks }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}