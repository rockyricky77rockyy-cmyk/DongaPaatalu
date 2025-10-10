import React from 'react';
// Removed unused Play icon import
// Removed unused Button component import
import NeonLogo from '@/components/NeonLogo';
import Visualizer from '@/components/Visualizer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
// Removed unused useNewReleases hook import
import { cn } from '@/lib/utils';
import TrackThumbnail from '../TrackThumbnail';

const HomeHeroSection = () => {
  const isMobile = useIsMobile();
  const { isPlaying, playTrack, currentTrack, togglePlayPause } = useMusicPlayer();
  // Removed unused newReleases data fetch

  return (
    <div className="relative bg-gradient-to-br from-card via-card to-secondary/20 rounded-3xl p-4 sm:p-8 overflow-hidden border border-primary/20 shadow-card">
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="relative flex items-center justify-center">
          {/* Left Visualizer - behind the disc */}
          <div className="absolute -left-16 md:-left-24 top-1/2 -translate-y-1/2 h-32 md:h-48 z-[1]">
            <Visualizer barCount={15} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} />
          </div>

          {/* Disc/Logo Container - now clickable for play/pause */}
          <div
            className={cn(
              "relative w-32 h-32 sm:w-48 sm:h-48 rounded-full flex items-center justify-center overflow-hidden border border-primary/50 shadow-neon cursor-pointer z-10",
              isPlaying && "animate-spin-slow"
            )}
            onClick={togglePlayPause} // Click disc to play/pause
          >
            {currentTrack && isPlaying ? (
              <TrackThumbnail
                thumbnail={currentTrack.thumbnail}
                title={currentTrack.title}
                className="w-full h-full rounded-full object-cover"
                iconClassName="w-12 h-12 text-white"
              />
            ) : (
              <NeonLogo size={isMobile ? "small" : "medium"} />
            )}
          </div>

          {/* Right Visualizer - behind the disc */}
          <div className="absolute -right-16 md:-right-24 top-1/2 -translate-y-1/2 h-32 md:h-48 z-[1]">
            <Visualizer barCount={15} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroSection;