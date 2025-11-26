import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Headphones } from 'lucide-react';
import { useYouTubeArtistTracks } from '@/hooks/use-youtube-music';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { formatDuration } from '@/lib/utils'; // Import formatDuration

const ArtistDetailsPage = () => {
  const navigate = useNavigate();
  const { artistId } = useParams<{ artistId: string }>();
  const location = useLocation();
  const { artistName: initialArtistName, artistThumbnail: initialArtistThumbnail } = (location.state || {}) as { artistName?: string; artistThumbnail?: string };

  console.log("ArtistDetailsPage loaded.");
  console.log("Received artistId from URL params:", artistId);
  console.log("Received state from location:", { initialArtistName, initialArtistThumbnail });

  const { data, isLoading, isError, error } = useYouTubeArtistTracks(artistId || null);
  const { playTrack } = useMusicPlayer();

  const artistName = String(data?.artistName || initialArtistName || 'Unknown Artist'); // Ensure artistName is always a string
  const artistThumbnail = data?.artistThumbnail || initialArtistThumbnail;

  const handlePlayAll = () => {
    if (data && data.tracks.length > 0) {
      // Play the first track and set the entire artist's top tracks as the current playlist
      playTrack(
        {
          videoId: data.tracks[0].videoId,
          title: data.tracks[0].title,
          artist: data.tracks[0].artist,
          thumbnail: data.tracks[0].thumbnail,
          album: data.tracks[0].album,
        },
        data.tracks.map(track => ({ // Map to the simpler Track interface
          videoId: track.videoId,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail,
          album: track.album,
        })),
        0 // Start index
      );
    }
  };

  const handlePlayIndividualTrack = (track: typeof data.tracks[0], index: number) => {
    if (data && data.tracks.length > 0) {
      playTrack(
        {
          videoId: track.videoId,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail,
          album: track.album,
        },
        data.tracks.map(t => ({ // Map to the simpler Track interface
          videoId: t.videoId,
          title: t.title,
          artist: t.artist,
          thumbnail: t.thumbnail,
          album: t.album,
        })),
        index // Start index for the clicked track
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Search
          </Button>
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-32 h-32 sm:w-48 sm:h-48 rounded-full" />
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
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Search
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Artist Details</h1>
          <p className="text-destructive">Error loading artist tracks: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Search
        </Button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <TrackThumbnail
            thumbnail={artistThumbnail}
            title={artistName}
            className="w-32 h-32 sm:w-48 sm:h-48 rounded-full shadow-neon-strong flex-shrink-0"
            iconClassName="w-16 h-16 text-white opacity-50"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{artistName}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">Artist</p>
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

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Top Tracks</h2>
        <div className="space-y-4">
          {data?.tracks && data.tracks.length > 0 ? (
            data.tracks.map((track, index) => (
              <div
                key={track.videoId}
                className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer border border-border hover:border-primary/50 hover:shadow-neon"
                onClick={() => handlePlayIndividualTrack(track, index)}
              >
                <TrackThumbnail
                  thumbnail={track.thumbnail}
                  title={track.title}
                  className="w-12 h-12 rounded-md flex-shrink-0"
                  iconClassName="w-6 h-6 text-primary"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{track.artist} {track.album && `• ${track.album}`}</p>
                </div>
                {track.duration && <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>}
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                  <Play className="w-4 h-4 fill-current" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No tracks found for this artist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailsPage;