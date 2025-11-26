import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play } from 'lucide-react';
import { useTracks } from '@/hooks/use-tracks';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { formatDuration } from '@/lib/utils';
import Visualizer from '@/components/Visualizer'; // Import Visualizer

const MusicPage = () => {
  const navigate = useNavigate();
  const { data: tracks, isLoading, isError, error } = useTracks();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer(); // Get currentTrack and isPlaying

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Music</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
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
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Music</h1>
          <p className="text-destructive">Error loading tracks: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Music</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks?.map((track) => {
            const isCurrentTrack = currentTrack?.videoId === track.video_id;
            return (
              <div 
                key={track.id} 
                className="group cursor-pointer bg-card rounded-xl p-6 shadow-card border border-border relative overflow-hidden hover:border-primary/50 hover:shadow-neon transition-all"
                onClick={() => playTrack({ videoId: track.video_id || '', title: track.title, artist: String(track.artist), thumbnail: track.thumbnail, album: track.album, duration: track.duration })}
              >
                <TrackThumbnail 
                  thumbnail={track.thumbnail} 
                  title={track.title} 
                  color={track.color} 
                  className="w-full h-32 rounded-md mb-4" 
                  iconClassName="w-12 h-12 text-white opacity-70"
                />
                <h2 className="text-xl font-semibold text-foreground mb-2">{track.title}</h2>
                <p className="text-muted-foreground">{String(track.artist)} {track.album && `• ${track.album}`}</p>
                {track.duration && (
                  <div className="flex items-center absolute top-4 right-4 bg-card/70 px-2 py-1 rounded-md">
                    {isCurrentTrack && isPlaying && (
                      <Visualizer barCount={5} className="h-4 w-8 mr-2" isPlaying={isPlaying} animationIntervalMs={150} />
                    )}
                    <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                  </div>
                )}
                <Button 
                  size="icon" 
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                >
                  <Play className="w-5 h-5 fill-current" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;