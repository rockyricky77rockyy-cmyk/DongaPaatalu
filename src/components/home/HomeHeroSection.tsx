import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NeonLogo from '@/components/NeonLogo';
import Visualizer from '@/components/Visualizer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { useNewReleases } from '@/hooks/use-new-releases'; // Import useNewReleases

const HomeHeroSection = () => {
  const isMobile = useIsMobile();
  const { isPlaying, playTrack } = useMusicPlayer();
  const { data: newReleases } = useNewReleases(); // Fetch new releases

  const handlePlayFeatured = () => {
    if (newReleases && newReleases.length > 0) {
      const firstNewRelease = newReleases[0];
      playTrack({
        videoId: firstNewRelease.videoId || '', // Corrected from video_id to videoId
        title: firstNewRelease.title,
        artist: firstNewRelease.artist,
        thumbnail: firstNewRelease.thumbnail,
        album: firstNewRelease.album,
      });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-card via-card to-secondary/20 rounded-3xl p-4 sm:p-8 overflow-hidden border border-primary/20 shadow-card">
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex-1 flex justify-center mb-6 sm:mb-0">
          <div className="relative">
            <NeonLogo size={isMobile ? "small" : "medium"} /> {/* Adjusted logo size */}
            <Button
              size={isMobile ? "md" : "lg"}
              className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon-strong"
              onClick={handlePlayFeatured} // Add onClick handler
              disabled={!newReleases || newReleases.length === 0} // Disable if no new releases
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-white" /> {/* Adjusted icon size */}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 sm:mt-6">
        <Visualizer barCount={isMobile ? 20 : 40} className="h-12 sm:h-16" isPlaying={isPlaying} animationIntervalMs={100} /> {/* Adjusted visualizer height */}
      </div>
    </div>
  );
};

export default HomeHeroSection;