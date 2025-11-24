import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, List } from 'lucide-react';
import { useYouTubePlaylistTracks } from '@/hooks/use-youtube-music';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';

const PlaylistDetailsPage = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams<{ playlistId: string }>();
  const location = useLocation();
  const { playlistName: initialPlaylistName, playlistThumbnail: initialPlaylistThumbnail } = (location.state || {}) as { playlistName?: string; playlistThumbnail?: string };

  // Add a client-side check for invalid playlistId from URL params
  if (!playlistId || playlistId === 'undefined') {
    console.error("Invalid playlistId received from URL params:", playlistId);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/playlists')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Playlists
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Playlist Not Found</h1>
          <p className="text-destructive">The playlist ID is missing or invalid. Please go back and select a valid playlist.</p>
        </div>
      </div>
    );
  }

  console.log("PlaylistDetailsPage loaded.");
  console.log("Received playlistId from URL params:", playlistId);
  console.log("Received state from location:", { initialPlaylistName, initialPlaylistThumbnail });

  const { data, isLoading, isError, error } = useYouTubePlaylistTracks(playlistId, initialPlaylistName || null); // playlistId is now guaranteed to be a valid string here
  const { playTrack } = useMusicPlayer();

  const playlistName = String(data?.playlistName || initialPlaylistName || 'Unknown Playlist'); // Ensure playlistName is always a string
  const playlistThumbnail = data?.playlistThumbnail || initialPlaylistThumbnail;
  const trackCount = data?.trackCount || 0;

  const handlePlayAll = () => {
    if (data && data.tracks.length > 0) {
      // Play the first track and set the entire playlist as the current playlist
      playTrack(
        {
          videoId: data.tracks[0].videoId,
          title: data.tracks[0].title,
          artist: String(data.tracks[0].artist),
          thumbnail: data.tracks[0].thumbnail,
          album: data.tracks[0].album,
        },
        data.tracks.map(track => ({ // Map to the simpler Track interface
          videoId: track.videoId,
          title: track.title,
          artist: String(track.artist),
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
          artist: String(track.artist),
          thumbnail: track.thumbnail,
          album: track.album,
        },
        data.tracks.map(t => ({ // Map to the simpler Track interface
          videoId: t.videoId,
          title: t.title,
          artist: String(t.artist),
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
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Playlists
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
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Playlists
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Playlist Details</h1>
          <p className="text-destructive">Error loading playlist tracks: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Playlists
        </Button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <TrackThumbnail
            thumbnail={playlistThumbnail}
            title={playlistName}
            className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl shadow-neon-strong flex-shrink-0"
            iconClassName="w-16 h-16 text-white opacity-50"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{playlistName}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">{trackCount} tracks</p>
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

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Tracks</h2>
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
                  <p className="text-sm text-muted-foreground truncate">{String(track.artist)} {track.album && `• ${track.album}`}</p>
                </div>
                {track.duration && <span className="text-sm text-muted-foreground">{track.duration}</span>}
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                  <Play className="w-4 h-4 fill-current" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No tracks found for this playlist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailsPage;