import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils'; // Import cn for conditional classnames

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
  const { playerRef, setDuration, setCurrentTime, setPlaybackProgress } = useMusicPlayer();
  const intervalRef = useRef<number | null>(null);

  const opts: YouTubeProps['opts'] = {
    height: '1', // Set to 1px to ensure API functions, but visually hidden
    width: '1',  // Set to 1px to ensure API functions, but visually hidden
    playerVars: {
      autoplay: 1, // Auto-play the video
      controls: 0, // Hide player controls
      disablekb: 1, // Disable keyboard controls
      fs: 0, // Disable fullscreen button
      modestbranding: 1, // Hide YouTube logo
      rel: 0, // Do not show related videos
      showinfo: 0, // Hide video title and uploader info
      iv_load_policy: 3, // Hide video annotations
      origin: window.location.origin, // Crucial for cross-origin communication
    },
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
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
    onEnd?.(event);
  };

  // New error handler to catch errors from the YouTube player
  const handlePlayerError = (event: any) => {
    console.error("YouTube Player encountered an error:", event);
    // You can add more specific error handling here, e.g., show a toast notification
    // or try to play the next track.
    onError?.(event); // Call the prop if provided
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
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.stopVideo();
        setPlaybackProgress(0);
        setCurrentTime(0);
        setDuration(0);
      }
    }
  }, [videoId, playerRef, setPlaybackProgress, setCurrentTime, setDuration]);

  useEffect(() => {
    return () => {
      stopProgressInterval();
    };
  }, []);

  if (!videoId) {
    return null; // Don't render the player if no videoId is provided
  }

  return (
    <div className={cn("hidden", className)}> {/* Use 'hidden' class to hide it visually */}
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnd={handleEnd}
        onError={handlePlayerError} // Use the new error handler
        onStateChange={onStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
        onPlaybackQualityChange={onPlaybackQualityChange}
      />
    </div>
  );
};

export default YouTubeEmbed;