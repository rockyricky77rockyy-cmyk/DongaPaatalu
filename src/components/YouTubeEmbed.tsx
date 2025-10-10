import React, { useEffect, useRef, useState } from 'react';
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
  const { playerRef, setDuration, setCurrentTime, setPlaybackProgress, setIsPlaying } = useMusicPlayer();
  const intervalRef = useRef<number | null>(null);
  const [internalVideoId, setInternalVideoId] = useState<string | undefined>(undefined); // Use undefined initially

  // This effect manages the videoId passed to the YouTube component
  useEffect(() => {
    if (videoId) {
      setInternalVideoId(videoId);
    } else {
      // If videoId becomes null, stop the player and clear the internal videoId
      if (playerRef.current) {
        playerRef.current.stopVideo();
        setPlaybackProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
      }
      setInternalVideoId(undefined); // Clear the videoId in the player
    }
  }, [videoId, playerRef, setPlaybackProgress, setCurrentTime, setDuration, setIsPlaying]);


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
    // If a videoId was set before ready, ensure it starts playing
    if (internalVideoId && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
      playerRef.current.playVideo();
    }
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
    setIsPlaying(false); // Stop playing on error
  };

  const startProgressInterval = (player: any) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
        const current = player.getCurrentTime();
        const total = player.getDuration();
        setCurrentTime(current);
        if (total > 0) {
          setPlaybackProgress((current / total) * 100);
        }
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
    return () => {
      // Cleanup function: clear interval when component unmounts
      stopProgressInterval();
      // Do NOT clear playerRef.current here, as it's managed by the context
    };
  }, []); // Empty dependency array ensures this runs once on mount and once on unmount

  // Always render the YouTube component, but pass internalVideoId
  return (
    <div className={cn("hidden", className)}> {/* Use 'hidden' class to hide it visually */}
      <YouTube
        videoId={internalVideoId} // Use internalVideoId
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