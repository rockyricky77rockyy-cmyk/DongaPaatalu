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
  const playAttemptTimeoutRef = useRef<number | null>(null);
  const [internalVideoId, setInternalVideoId] = useState<string | undefined>(undefined);
  const [toastId, setToastId] = useState<string | number | null>(null);

  // This effect manages the videoId passed to the YouTube component
  useEffect(() => {
    if (videoId) {
      setInternalVideoId(videoId);
      if (toastId) {
        toast.dismiss(toastId);
        setToastId(null);
      }
    } else {
      if (playerRef.current) {
        playerRef.current.stopVideo();
        setPlaybackProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
      }
      setInternalVideoId(undefined);
      stopProgressInterval();
      clearAutoplayTimeout();
      if (toastId) {
        toast.dismiss(toastId);
        setToastId(null);
      }
    }
  }, [videoId, playerRef, setPlaybackProgress, setCurrentTime, setDuration, setIsPlaying, toastId]);

  // NEW: Effect to check if YouTube API script loaded
  useEffect(() => {
    const checkApiLoaded = setTimeout(() => {
      if (typeof window.YT === 'undefined' || !window.YT.Player) {
        console.error(
          "YouTubeEmbed: window.YT API not loaded. This might be due to a Content Security Policy (CSP) blocking script loading, or a network issue in the WebView."
        );
      } else {
        console.log("YouTubeEmbed: window.YT API detected.");
      }
    }, 5000); // Check after 5 seconds

    return () => clearTimeout(checkApiLoaded);
  }, []);


  const opts: YouTubeProps['opts'] = {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1,
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
    console.log("YouTubeEmbed: Player is ready. Player instance:", playerRef.current); // Added log
    onReady?.(event);
    
    if (internalVideoId && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
      playerRef.current.playVideo();
      clearAutoplayTimeout();
      playAttemptTimeoutRef.current = setTimeout(() => {
        if (playerRef.current && playerRef.current.getPlayerState() !== window.YT.PlayerState.PLAYING) {
          const trackTitle = currentTrack?.title || 'this track';
          const newToastId = toast.info(`Autoplay blocked for "${trackTitle}".`, {
            description: "Your device might require a direct tap to start playback.",
            duration: 10000,
            action: {
              label: "Tap to Play",
              onClick: () => {
                playerRef.current?.playVideo();
                toast.dismiss(newToastId);
              },
            },
            onDismiss: () => setToastId(null),
            onAutoClose: () => setToastId(null),
          });
          setToastId(newToastId);
        }
      }, 2000) as unknown as number;
    }
  };

  const handlePlay = (event: any) => {
    console.log("YouTubeEmbed: Player state changed to PLAYING."); // Added log
    clearAutoplayTimeout();
    if (toastId) {
      toast.dismiss(toastId);
      setToastId(null);
    }
    setDuration(event.target.getDuration());
    startProgressInterval(event.target);
    onPlay?.(event);
  };

  const handlePause = (event: any) => {
    console.log("YouTubeEmbed: Player state changed to PAUSED."); // Added log
    clearAutoplayTimeout();
    stopProgressInterval();
    onPause?.(event);
  };

  const handleEnd = (event: any) => {
    console.log("YouTubeEmbed: Player state changed to ENDED."); // Added log
    clearAutoplayTimeout();
    stopProgressInterval();
    setPlaybackProgress(0);
    setCurrentTime(0);
    onEnd?.(event);
  };

  const handlePlayerError = (event: any) => {
    console.error("YouTubeEmbed: YouTube Player encountered an error:", event); // Modified log
    clearAutoplayTimeout();
    if (toastId) {
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