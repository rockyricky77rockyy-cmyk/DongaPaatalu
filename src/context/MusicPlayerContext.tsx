import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  album?: string;
}

type RepeatMode = 'none' | 'track' | 'all';

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
  playNextTrack: () => void; // Play the next track in the recently searched list
  playPreviousTrack: () => void; // Play the previous track in the recently searched list
  isShuffling: boolean; // New: State for shuffle mode
  toggleShuffle: () => void; // New: Function to toggle shuffle mode
  repeatMode: RepeatMode; // New: State for repeat mode
  toggleRepeatMode: () => void; // New: Function to toggle repeat mode
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>; // Added setIsPlaying
  setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>; // Added setCurrentTrack
  currentRecommendations: Track[]; // NEW: List of current recommendations
  updateRecommendations: (tracks: Track[], currentTrackVideoId: string | null) => void; // NEW: Function to update recommendations
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
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const playerRef = useRef<any | null>(null);

  // NEW: State for recommendations queue
  const [currentRecommendations, setCurrentRecommendations] = useState<Track[]>([]);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState<number | null>(null);

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

  // NEW: Effect to update currentRecommendationIndex when currentTrack or currentRecommendations changes
  useEffect(() => {
    if (currentTrack && currentRecommendations.length > 0) {
      const index = currentRecommendations.findIndex(t => t.videoId === currentTrack.videoId);
      setCurrentRecommendationIndex(index !== -1 ? index : null);
    } else {
      setCurrentRecommendationIndex(null);
    }
  }, [currentTrack, currentRecommendations]);


  const addRecentlySearched = useCallback((track: Track) => {
    setRecentlySearched((prev) => {
      const filtered = prev.filter((t) => t.videoId !== track.videoId);
      return [track, ...filtered].slice(0, MAX_RECENTLY_SEARCHED);
    });
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    addRecentlySearched(track);
    // When a new track is played, reset recommendation index and clear previous recommendations
    setCurrentRecommendationIndex(null);
    setCurrentRecommendations([]); // Clear recommendations, they will be re-populated by PlaylistQueue

    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(track.videoId);
    }
  }, [addRecentlySearched, playerRef]);

  // NEW: Function to update recommendations from external components (e.g., PlaylistQueue)
  const updateRecommendations = useCallback((tracks: Track[], currentTrackVideoId: string | null) => {
    setCurrentRecommendations(tracks);
    if (currentTrackVideoId) {
      const index = tracks.findIndex(t => t.videoId === currentTrackVideoId);
      setCurrentRecommendationIndex(index !== -1 ? index : null);
    } else {
      setCurrentRecommendationIndex(null);
    }
  }, []);


  const playNextTrack = useCallback(() => {
    if (!currentTrack) {
      setIsPlaying(false);
      setCurrentTrack(null);
      playerRef.current?.stopVideo();
      return;
    }

    if (repeatMode === 'track') {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
      return;
    }

    let nextTrackToPlay: Track | null = null;

    // Priority 1: Play from currentRecommendations if available and not exhausted
    if (currentRecommendations.length > 0 && currentRecommendationIndex !== null) {
      let nextRecIndex = (currentRecommendationIndex + 1) % currentRecommendations.length;
      if (isShuffling) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * currentRecommendations.length);
        } while (randomIndex === currentRecommendationIndex && currentRecommendations.length > 1);
        nextRecIndex = randomIndex;
      }
      nextTrackToPlay = currentRecommendations[nextRecIndex];
      setCurrentRecommendationIndex(nextRecIndex); // Update index for recommendations
    }

    // Fallback to recentlySearched if recommendations are exhausted or not available
    if (!nextTrackToPlay && recentlySearched.length > 0) {
      let nextSearchIndex = currentTrackIndex;
      if (isShuffling) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * recentlySearched.length);
        } while (randomIndex === currentTrackIndex && recentlySearched.length > 1);
        nextSearchIndex = randomIndex;
      } else if (currentTrackIndex !== null) {
        nextSearchIndex = (currentTrackIndex + 1) % recentlySearched.length;
      }
      if (nextSearchIndex !== null) {
        nextTrackToPlay = recentlySearched[nextSearchIndex];
        setCurrentTrackIndex(nextSearchIndex); // Update index for recently searched
      }
    }

    if (nextTrackToPlay) {
      setCurrentTrack(nextTrackToPlay);
      setIsPlaying(true);
      playerRef.current?.loadVideoById(nextTrackToPlay.videoId);
      addRecentlySearched(nextTrackToPlay); // Add to recently searched if it's a recommendation
    } else if (repeatMode === 'all' && recentlySearched.length > 0) {
      // If repeat all and no next track, loop to first track in recently searched
      const firstTrack = recentlySearched[0];
      setCurrentTrack(firstTrack);
      setIsPlaying(true);
      playerRef.current?.loadVideoById(firstTrack.videoId);
      setCurrentTrackIndex(0);
      setCurrentRecommendationIndex(null); // Reset recommendation index
    } else {
      setIsPlaying(false);
      setCurrentTrack(null);
      playerRef.current?.stopVideo();
      setCurrentRecommendationIndex(null); // Reset recommendation index
    }
  }, [currentTrack, currentTrackIndex, recentlySearched, isShuffling, repeatMode, playerRef, currentRecommendations, currentRecommendationIndex, addRecentlySearched]);

  const playPreviousTrack = useCallback(() => {
    if (!currentTrack) {
      setIsPlaying(false);
      setCurrentTrack(null);
      playerRef.current?.stopVideo();
      return;
    }

    if (repeatMode === 'track') {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
      return;
    }

    let prevTrackToPlay: Track | null = null;

    // Priority 1: Play from currentRecommendations if available and not exhausted
    if (currentRecommendations.length > 0 && currentRecommendationIndex !== null) {
      let prevRecIndex = (currentRecommendationIndex - 1 + currentRecommendations.length) % currentRecommendations.length;
      if (isShuffling) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * currentRecommendations.length);
        } while (randomIndex === currentRecommendationIndex && currentRecommendations.length > 1);
        prevRecIndex = randomIndex;
      }
      prevTrackToPlay = currentRecommendations[prevRecIndex];
      setCurrentRecommendationIndex(prevRecIndex); // Update index for recommendations
    }

    // Fallback to recentlySearched if recommendations are exhausted or not available
    if (!prevTrackToPlay && recentlySearched.length > 0) {
      let prevSearchIndex = currentTrackIndex;
      if (isShuffling) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * recentlySearched.length);
        } while (randomIndex === currentTrackIndex && recentlySearched.length > 1);
        prevSearchIndex = randomIndex;
      } else if (currentTrackIndex !== null) {
        prevSearchIndex = (currentTrackIndex - 1 + recentlySearched.length) % recentlySearched.length;
      }
      if (prevSearchIndex !== null) {
        prevTrackToPlay = recentlySearched[prevSearchIndex];
        setCurrentTrackIndex(prevSearchIndex); // Update index for recently searched
      }
    }

    if (prevTrackToPlay) {
      setCurrentTrack(prevTrackToPlay);
      setIsPlaying(true);
      playerRef.current?.loadVideoById(prevTrackToPlay.videoId);
      addRecentlySearched(prevTrackToPlay); // Add to recently searched if it's a recommendation
    } else if (repeatMode === 'all' && recentlySearched.length > 0) {
      // If repeat all and no previous track, loop to last track in recently searched
      const lastTrack = recentlySearched[recentlySearched.length - 1];
      setCurrentTrack(lastTrack);
      setIsPlaying(true);
      playerRef.current?.loadVideoById(lastTrack.videoId);
      setCurrentTrackIndex(recentlySearched.length - 1);
      setCurrentRecommendationIndex(null); // Reset recommendation index
    } else {
      setIsPlaying(false);
      setCurrentTrack(null);
      playerRef.current?.stopVideo();
      setCurrentRecommendationIndex(null); // Reset recommendation index
    }
  }, [currentTrack, currentTrackIndex, recentlySearched, isShuffling, repeatMode, playerRef, currentRecommendations, currentRecommendationIndex, addRecentlySearched]);


  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, [playerRef]);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  }, [playerRef]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffling((prev) => !prev);
  }, []);

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'track';
      return 'none';
    });
  }, []);

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
    isShuffling,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    setIsPlaying,
    setCurrentTrack,
    currentRecommendations, // NEW
    updateRecommendations, // NEW
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