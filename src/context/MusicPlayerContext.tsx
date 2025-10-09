import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  album?: string;
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlayPause: () => void;
  playerRef: React.MutableRefObject<any | null>; // Ref to the YouTube player instance
  playbackProgress: number; // 0-100
  setPlaybackProgress: (progress: number) => void;
  duration: number; // in seconds
  currentTime: number; // in seconds
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  recentlySearched: Track[]; // List of recently searched tracks
  addRecentlySearched: (track: Track) => void; // Function to add a track to recently searched
  playNextTrack: () => void; // New: Play the next track in the recently searched list
  playPreviousTrack: () => void; // New: Play the previous track in the recently searched list
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const RECENTLY_SEARCHED_KEY = 'harmonix_recently_searched';
const MAX_RECENTLY_SEARCHED = 5; // Limit the number of recent searches

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [recentlySearched, setRecentlySearched] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(RECENTLY_SEARCHED_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null); // New state for current track index
  const playerRef = useRef<any | null>(null);

  // Effect to save recently searched to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(RECENTLY_SEARCHED_KEY, JSON.stringify(recentlySearched));
    }
  }, [recentlySearched]);

  // Effect to update currentTrackIndex when currentTrack or recentlySearched changes
  useEffect(() => {
    if (currentTrack && recentlySearched.length > 0) {
      const index = recentlySearched.findIndex(t => t.videoId === currentTrack.videoId);
      setCurrentTrackIndex(index !== -1 ? index : null);
    } else {
      setCurrentTrackIndex(null);
    }
  }, [currentTrack, recentlySearched]);

  const addRecentlySearched = useCallback((track: Track) => {
    setRecentlySearched((prev) => {
      const filtered = prev.filter((t) => t.videoId !== track.videoId);
      return [track, ...filtered].slice(0, MAX_RECENTLY_SEARCHED);
    });
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    addRecentlySearched(track); // This will trigger the useEffect above to update currentTrackIndex

    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(track.videoId);
    }
  }, [addRecentlySearched]);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex !== null && recentlySearched.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % recentlySearched.length;
      const nextTrack = recentlySearched[nextIndex];
      if (nextTrack) {
        setCurrentTrack(nextTrack); // Directly set currentTrack
        setIsPlaying(true);
        if (playerRef.current && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(nextTrack.videoId);
        }
      }
    }
  }, [currentTrackIndex, recentlySearched, playerRef]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrackIndex !== null && recentlySearched.length > 0) {
      const prevIndex = (currentTrackIndex - 1 + recentlySearched.length) % recentlySearched.length;
      const prevTrack = recentlySearched[prevIndex];
      if (prevTrack) {
        setCurrentTrack(prevTrack); // Directly set currentTrack
        setIsPlaying(true);
        if (playerRef.current && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(prevTrack.videoId);
        }
      }
    }
  }, [currentTrackIndex, recentlySearched, playerRef]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const value = {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    resumeTrack,
    togglePlayPause,
    playerRef,
    playbackProgress,
    setPlaybackProgress,
    duration,
    currentTime,
    setDuration,
    setCurrentTime,
    recentlySearched,
    addRecentlySearched,
    playNextTrack,
    playPreviousTrack,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};