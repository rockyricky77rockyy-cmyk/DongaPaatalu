import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn, openExternalLink } from '@/lib/utils';
import { toast } from 'sonner';

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
  const { playerRef, setDuration, setCurrentTime, setPlaybackProgress, setIsPlaying, currentTrack } = useMusicPlayer();
  const intervalRef = useRef<number | null>(null);
  const playAttemptTimeoutRef = useRef<number | null>(null); // New ref for autoplay detection timeout
  const [internalVideoId, setInternalVideoId] = useState<string | undefined>(undefined);
  const [toastId, setToastId] = useState<string | number | null>(null); // To manage toast dismissal

  // This effect manages the videoId passed to the YouTube component
  useEffect(() => {
    if (videoId) {
      setInternalVideoId(videoId);
      // Clear any previous autoplay detection toast
      if (toastId) {
        toast.dismiss(toastId);
        setToastId(null);
      }
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
      stopProgressInterval();
      clearAutoplayTimeout();
      if (toastId) {
        toast.dismiss(toastId);
        setToastId(null);
      }
    }
  }, [videoId, playerRef, setPlaybackProgress, setCurrentTime, setDuration, setIsPlaying, toastId]);


  const opts: YouTubeProps['opts'] = {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1, // Auto-play the video
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      origin: window.location.origin,
    },
  };

  const clearAutoplayTimeout = () => {
    if (playAttemptTimeoutRef.current) {
      clearTimeout(playAttemptTimeoutRef.current);
      playAttemptTimeoutRef.current = null;
    }
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    onReady?.(event);
    
    // Attempt to play and set a timeout to detect if autoplay was blocked
    if (internalVideoId && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
      playerRef.current.playVideo();
      clearAutoplayTimeout(); // Clear any previous timeout
      playAttemptTimeoutRef.current = setTimeout(() => {
        // If after 2 seconds, the player is not playing, assume autoplay was blocked
        if (playerRef.current && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
          const trackTitle = currentTrack?.title || 'this track';
          const newToastId = toast.info(`Autoplay blocked for "${trackTitle}".`, {
            description: "Your device might require a direct tap to start playback.",
            duration: 10000, // Keep toast visible for a while
            action: {
              label: "Tap to Play",
              onClick: () => {
                playerRef.current?.playVideo();
                toast.dismiss(newToastId); // Dismiss toast after user taps
              },
            },
            onDismiss: () => setToastId(null),
            onAutoClose: () => setToastId(null),
          });
          setToastId(newToastId);
        }
      }, 2000) as unknown as number; // 2-second delay
    }
  };

  const handlePlay = (event: any) => {
    clearAutoplayTimeout(); // Clear timeout if playback starts successfully
    if (toastId) { // Dismiss autoplay toast if it was showing
      toast.dismiss(toastId);
      setToastId(null);
    }
    setDuration(event.target.getDuration());
    startProgressInterval(event.target);
    onPlay?.(event);
  };

  const handlePause = (event: any) => {
    clearAutoplayTimeout(); // Clear timeout if playback is paused
    stopProgressInterval();
    onPause?.(event);
  };

  const handleEnd = (event: any) => {
    clearAutoplayTimeout(); // Clear timeout if playback ends
    stopProgressInterval();
    setPlaybackProgress(0);
    setCurrentTime(0);
    onEnd?.(event);
  };

  const handlePlayerError = (event: any) => {
    console.error("YouTube Player encountered an error:", event);
    clearAutoplayTimeout(); // Clear timeout on error
    if (toastId) { // Dismiss autoplay toast if it was showing
      toast.dismiss(toastId);
      setToastId(null);
    }
    
    const videoUrl = `https://www.youtube.com/watch?v=${currentTrack?.videoId}`;
    const trackTitle = currentTrack?.title || 'this track';

    if (event.data === 150 || event.data === 101) {
      toast.error(`"${trackTitle}" cannot be played in the app.`, {
        description: "This video is restricted from being embedded. Try opening it in YouTube.",
        duration: 7000,
        action: {
          label: "Open in YouTube",
          onClick: () => openExternalLink(videoUrl),
        },
      });
    } else {
      toast.error(`Failed to play "${trackTitle}".`, {
        description: `Error code: ${event.data}. It might be unavailable or restricted.`,
        duration: 5000,
        action: {
          label: "Open in YouTube",
          onClick: () => openExternalLink(videoUrl),
        },
      });
    }
    
    onError?.(event);
    setIsPlaying(false);
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
    }, 1000) as unknown as number;
  };

  const stopProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopProgressInterval();
      clearAutoplayTimeout();
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [toastId]);

  return (
    <div className={cn("hidden", className)}>
      <YouTube
        videoId={internalVideoId}
        opts={opts}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnd={handleEnd}
        onError={handlePlayerError}
        onStateChange={onStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
        onPlaybackQualityChange={onPlaybackQualityChange}
      />
    </div>
  );
};

export default YouTubeEmbed;