import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

interface YouTubeEmbedProps {
  videoId: string | null;
  onReady?: (event: any) => void;
  onPlay?: (event: any) => void;
  onPause?: (event: any) => void;
  onEnd?: (event: any) => void;
  onError?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onPlaybackRateChange?: (event: any) => void;
  onPlaybackQualityChange?: (event: any) => void;
  className?: string;
}

const YouTubeEmbed = ({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onError,
  onStateChange,
  onPlaybackRateChange,
  onPlaybackQualityChange,
  className,
}: YouTubeEmbedProps) => {
  const { playerRef, isPlaying, setDuration, setCurrentTime, setPlaybackProgress, togglePlayPause } = useMusicPlayer();
  const intervalRef = useRef<number | null>(null);

  const opts: YouTubeProps['opts'] = {
    height: '0', // Hidden player, we control it programmatically
    width: '0',
    playerVars: {
      autoplay: 1, // Auto-play the video
      controls: 0, // Hide player controls
      disablekb: 1, // Disable keyboard controls
      fs: 0, // Disable fullscreen button
      modestbranding: 1, // Hide YouTube logo
      rel: 0, // Do not show related videos
      showinfo: 0, // Hide video title and uploader info
      iv_load_policy: 3, // Hide video annotations
    },
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    // The `isPlaying` state from context will be set by `onStateChange` in App.tsx
    // and `playTrack` in context. No need to force play here.
    onReady?.(event);
  };

  const handlePlay = (event: any) => {
    setDuration(event.target.getDuration());
    startProgressInterval(event.target);
    onPlay?.(event);
  };

  const handlePause = (event: any) => {
    stopProgressInterval();
    onPause?.(event);
  };

  const handleEnd = (event: any) => {
    stopProgressInterval();
    setPlaybackProgress(0);
    setCurrentTime(0);
    // The logic for playing the next track or looping is now handled in App.tsx's onStateChange
    onEnd?.(event);
  };

  const startProgressInterval = (player: any) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      const current = player.getCurrentTime();
      const total = player.getDuration();
      setCurrentTime(current);
      if (total > 0) {
        setPlaybackProgress((current / total) * 100);
      }
    }, 1000) as unknown as number; // Cast to number for clearInterval
  };

  const stopProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (playerRef.current) {
      if (videoId) {
        // If a new videoId is provided, load it.
        // The 'autoplay: 1' in opts will make it play automatically.
        // The onStateChange in App.tsx will then update the context's isPlaying state.
        playerRef.current.loadVideoById(videoId);
      } else {
        // If videoId becomes null, stop and clear player
        playerRef.current.stopVideo();
        setPlaybackProgress(0);
        setCurrentTime(0);
        setDuration(0);
      }
    }
  }, [videoId, playerRef, setPlaybackProgress, setCurrentTime, setDuration]); // Removed isPlaying and togglePlayPause from dependencies

  useEffect(() => {
    return () => {
      stopProgressInterval();
    };
  }, []);

  if (!videoId) {
    return null; // Don't render the player if no videoId is provided
  }

  return (
    <div className={className}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnd={handleEnd}
        onError={onError}
        onStateChange={onStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
        onPlaybackQualityChange={onPlaybackQualityChange}
      />
    </div>
  );
};

export default YouTubeEmbed;