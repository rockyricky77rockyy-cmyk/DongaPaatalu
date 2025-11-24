import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
import { YouTubeMusicTrack } from '@/hooks/use-youtube-music'; // Import YouTubeMusicTrack

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
  playTrack: (track: Track, playlist?: Track[], startIndex?: number, isFromRecommendations?: boolean) => void; // Added isFromRecommendations
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
  playNextTrack: () => void; // Play the next track in the current playlist/queue
  playPreviousTrack: () => void; // Play the previous track in the current playlist/queue
  isShuffling: boolean; // New: State for shuffle mode
  toggleShuffle: () => void; // New: Function to toggle shuffle mode
  repeatMode: RepeatMode; // New: State for repeat mode
  toggleRepeatMode: () => void; // New: Function to toggle repeat mode
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>; // Added setIsPlaying
  setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>; // Added setCurrentTrack
  currentPlaylist: Track[]; // The currently active playlist/queue
  currentPlaylistIndex: number | null; // The index of the current track in the active playlist
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
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]); // New state for the active playlist
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number | null>(null); // New state for the index in the active playlist
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const playerRef = useRef<any | null>(null);

  // Effect to save recently searched to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(RECENTLY_SEARCHED_KEY, JSON.stringify(recentlySearched));
    }
  }, [recentlySearched]);

  const addRecentlySearched = useCallback((track: Track) => {
    setRecentlySearched((prev) => {
      const filtered = prev.filter((t) => t.videoId !== track.videoId);
      return [track, ...filtered].slice(0, MAX_RECENTLY_SEARCHED);
    });
  }, []);

  const playTrack = useCallback((track: Track, playlist?: Track[], startIndex?: number, isFromRecommendations: boolean = false) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    addRecentlySearched(track);

    if (isFromRecommendations) {
      // If playing a track explicitly from recommendations, treat it as a new single track
      // so that new recommendations are fetched after it finishes.
      setCurrentPlaylist([track]);
      setCurrentPlaylistIndex(0);
    } else if (playlist && startIndex !== undefined) {
      setCurrentPlaylist(playlist);
      setCurrentPlaylistIndex(startIndex);
    } else {
      // If playing a single track not from an explicit playlist, create a temporary playlist
      setCurrentPlaylist([track]);
      setCurrentPlaylistIndex(0);
    }

    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(track.videoId);
    }
  }, [addRecentlySearched]);

  const loadAndPlayRelatedTracks = useCallback(async (lastPlayedTrack: Track) => {
    console.log("MusicPlayerContext: Attempting to load and play related tracks.");
    try {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/related-tracks', {
        body: {
          videoId: lastPlayedTrack.videoId,
          artist: lastPlayedTrack.artist,
          album: lastPlayedTrack.album,
        },
      });

      if (error) {
        console.error("Supabase Edge Function Error (related-tracks in context):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.relatedTracks && data.relatedTracks.length > 0) {
        const relatedTracks = data.relatedTracks as YouTubeMusicTrack[];
        setCurrentPlaylist(relatedTracks);
        setCurrentPlaylistIndex(0);
        playTrack(relatedTracks[0], relatedTracks, 0); // Play the first related track
        console.log("MusicPlayerContext: Successfully loaded and started playing related tracks.");
      } else {
        console.log("MusicPlayerContext: No related tracks found.");
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentPlaylist([]);
        setCurrentPlaylistIndex(null);
        playerRef.current?.stopVideo();
      }
    } catch (error) {
      console.error("MusicPlayerContext: Failed to load related tracks:", error);
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentPlaylist([]);
      setCurrentPlaylistIndex(null);
      playerRef.current?.stopVideo();
    }
  }, [playTrack]);


  const playNextTrack = useCallback(() => {
    if (!currentTrack || currentPlaylist.length === 0 || currentPlaylistIndex === null) {
      console.log("MusicPlayerContext: No current track, empty playlist, or invalid index. Stopping playback.");
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentPlaylist([]);
      setCurrentPlaylistIndex(null);
      playerRef.current?.stopVideo();
      return;
    }

    if (repeatMode === 'track') {
      console.log("MusicPlayerContext: Repeat track mode, replaying current track.");
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
      return;
    }

    let nextIndex = currentPlaylistIndex;

    if (isShuffling) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * currentPlaylist.length);
      } while (randomIndex === currentPlaylistIndex && currentPlaylist.length > 1);
      nextIndex = randomIndex;
    } else {
      nextIndex = (currentPlaylistIndex + 1);
    }

    if (nextIndex < currentPlaylist.length) {
      console.log(`MusicPlayerContext: Playing next track in current playlist. Index: ${nextIndex}`);
      const nextTrack = currentPlaylist[nextIndex];
      setCurrentPlaylistIndex(nextIndex);
      playTrack(nextTrack, currentPlaylist, nextIndex);
    } else if (repeatMode === 'all') {
      console.log("MusicPlayerContext: End of playlist, repeat all mode. Looping to first track.");
      const firstTrack = currentPlaylist[0];
      setCurrentPlaylistIndex(0);
      playTrack(firstTrack, currentPlaylist, 0);
    } else {
      console.log("MusicPlayerContext: End of playlist, no repeat. Attempting to load related tracks.");
      // End of current explicit playlist (e.g., album finished), transition to related tracks
      loadAndPlayRelatedTracks(currentTrack);
    }
  }, [currentTrack, currentPlaylist, currentPlaylistIndex, isShuffling, repeatMode, playerRef, playTrack, loadAndPlayRelatedTracks]);

  const playPreviousTrack = useCallback(() => {
    if (!currentTrack || currentPlaylist.length === 0 || currentPlaylistIndex === null) {
      console.log("MusicPlayerContext: No current track, empty playlist, or invalid index. Stopping playback.");
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentPlaylist([]);
      setCurrentPlaylistIndex(null);
      playerRef.current?.stopVideo();
      return;
    }

    if (repeatMode === 'track') {
      console.log("MusicPlayerContext: Repeat track mode, replaying current track.");
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
      return;
    }

    let prevIndex = currentPlaylistIndex;

    if (isShuffling) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * currentPlaylist.length);
      } while (randomIndex === currentPlaylistIndex && currentPlaylist.length > 1);
      prevIndex = randomIndex;
    } else {
      prevIndex = (currentPlaylistIndex - 1);
    }

    if (prevIndex >= 0) {
      console.log(`MusicPlayerContext: Playing previous track in current playlist. Index: ${prevIndex}`);
      const prevTrack = currentPlaylist[prevIndex];
      setCurrentPlaylistIndex(prevIndex);
      playTrack(prevTrack, currentPlaylist, prevIndex);
    } else if (repeatMode === 'all') {
      console.log("MusicPlayerContext: Start of playlist, repeat all mode. Looping to last track.");
      const lastTrack = currentPlaylist[currentPlaylist.length - 1];
      setCurrentPlaylistIndex(currentPlaylist.length - 1);
      playTrack(lastTrack, currentPlaylist, currentPlaylist.length - 1);
    } else {
      console.log("MusicPlayerContext: Start of playlist, no repeat. Cannot go back further.");
      // Optionally, stop playback or loop to the end if desired
      setIsPlaying(false);
      playerRef.current?.stopVideo();
    }
  }, [currentTrack, currentPlaylist, currentPlaylistIndex, isShuffling, repeatMode, playerRef, playTrack]);

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
    currentPlaylist, // Expose currentPlaylist
    currentPlaylistIndex, // Expose currentPlaylistIndex
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