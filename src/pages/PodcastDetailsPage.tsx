import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Podcast } from 'lucide-react';
import { useYouTubePlaylistTracks } from '@/hooks/use-youtube-music';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { formatDuration } from '@/lib/utils';
import Visualizer from '@/components/Visualizer'; // Import Visualizer

const PodcastDetailsPage = () => {
  const navigate = useNavigate();
  const { podcastId } = useParams<{ podcastId: string }>();
  const location = useLocation();
  const { podcastTitle: initialPodcastTitle, podcastThumbnail: initialPodcastThumbnail } = (location.state || {}) as { podcastTitle?: string; podcastThumbnail?: string };

  // Add a client-side check for invalid podcastId from URL params
  if (!podcastId || podcastId === 'undefined') {
    console.error("Invalid podcastId received from URL params:", podcastId);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Podcast Not Found</h1>
          <p className="text-destructive">The podcast ID is missing or invalid. Please go back and select a valid podcast.</p>
        </div>
      </div>
    );
  }

  console.log("PodcastDetailsPage loaded.");
  console.log("Received podcastId from URL params:", podcastId);
  console.log("Received state from location:", { initialPodcastTitle, initialPodcastThumbnail });

  const { data, isLoading, isError, error } = useYouTubePlaylistTracks(podcastId, initialPodcastTitle || null);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer(); // Get currentTrack and isPlaying

  const podcastTitle = String(data?.playlistName || initialPodcastTitle || 'Unknown Podcast');
  const podcastThumbnail = data?.playlistThumbnail || initialPodcastThumbnail;
  const episodeCount = data?.trackCount || 0;

  const handlePlayAll = () => {
    if (data && data.tracks.length > 0) {
      playTrack(
        {
          videoId: data.tracks[0].videoId,
          title: data.tracks[0].title,
          artist: String(data.tracks[0].artist),
          thumbnail: data.tracks[0].thumbnail,
          album: data.tracks[0].album,
        },
        data.tracks.map(track => ({
          videoId: track.videoId,
          title: track.title,
          artist: String(track.artist),
          thumbnail: track.thumbnail,
          album: track.album,
        })),
        0
      );
    }
  };

  const handlePlayIndividualEpisode = (track: typeof data.tracks[0], index: number) => {
    if (data && data.tracks.length > 0) {
      playTrack(
        {
          videoId: track.videoId,
          title: track.title,
          artist: String(track.artist),
          thumbnail: track.thumbnail,
          album: track.album,
        },
        data.tracks.map(t => ({
          videoId: t.videoId,
          title: t.title,
          artist: String(t.artist),
          thumbnail: t.thumbnail,
          album: t.album,
        })),
        index
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Podcasts
          </Button>
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-card rounded-lg">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Podcasts
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Podcast Details</h1>
          <p className="text-destructive">Error loading podcast episodes: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Podcasts
        </Button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <TrackThumbnail
            thumbnail={podcastThumbnail}
            title={podcastTitle}
            className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl shadow-neon-strong flex-shrink-0"
            iconClassName="w-16 h-16 text-white opacity-50"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{podcastTitle}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">{episodeCount} episodes</p>
            {data && data.tracks.length > 0 && (
              <Button
                className="mt-4 bg-primary text-primary-foreground hover:bg-accent shadow-neon"
                onClick={handlePlayAll}
              >
                <Play className="w-5 h-5 mr-2 fill-current" /> Play All
              </Button>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Episodes</h2>
        <div className="space-y-4">
          {data?.tracks && data.tracks.length > 0 ? (
            data.tracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.videoId === track.videoId;
              return (
                <div
                  key={track.videoId}
                  className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer border border-border hover:border-primary/50 hover:shadow-neon"
                  onClick={() => handlePlayIndividualEpisode(track, index)}
                >
                  <TrackThumbnail
                    thumbnail={track.thumbnail}
                    title={track.title}
                    className="w-12 h-12 rounded-md flex-shrink-0"
                    iconClassName="w-6 h-6 text-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{String(track.artist)}</p>
                  </div>
                  {track.duration && (
                    <div className="flex items-center">
                      {isCurrentTrack && isPlaying && (
                        <Visualizer barCount={5} className="h-4 w-8 mr-2" isPlaying={isPlaying} animationIntervalMs={150} />
                      )}
                      <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                    </div>
                  )}
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No episodes found for this podcast.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastDetailsPage;