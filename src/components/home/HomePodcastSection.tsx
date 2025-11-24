import React from 'react';
import { Podcast, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useYouTubeMusicPodcasts } from '@/hooks/use-youtube-music';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HomePodcastSectionProps {
  className?: string;
}

const HomePodcastSection = ({ className }: HomePodcastSectionProps) => {
  const navigate = useNavigate();
  // Fetch trending podcasts
  const { data: trendingPodcasts, isLoading: isLoadingTrending, isError: isErrorTrending, error: errorTrending } = useYouTubeMusicPodcasts('trending podcasts');
  // Fetch popular podcasts
  const { data: popularPodcasts, isLoading: isLoadingPopular, isError: isErrorPopular, error: errorPopular } = useYouTubeMusicPodcasts('popular podcasts');

  // Combine and deduplicate podcasts
  const allPodcasts = [...(trendingPodcasts || []), ...(popularPodcasts || [])];
  const uniquePodcasts = Array.from(new Map(allPodcasts.map(podcast => [podcast.podcastId, podcast])).values());

  const isLoading = isLoadingTrending || isLoadingPopular;
  const isError = isErrorTrending || isErrorPopular;
  const error = errorTrending || errorPopular; // Display the first error encountered

  if (isLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Podcasts</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-3 w-[140px] flex-shrink-0 md:w-auto md:flex-shrink">
              <Skeleton className="aspect-square rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Podcasts</h2>
        <p className="text-destructive">Error loading podcasts: {error?.message}</p>
      </div>
    );
  }

  if (!uniquePodcasts || uniquePodcasts.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Podcasts</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {uniquePodcasts.slice(0, 4).map((podcast) => (
          <div
            key={podcast.podcastId}
            className="group cursor-pointer bg-card rounded-2xl p-3 text-center transition-all border border-border hover:border-primary/50 hover:shadow-neon-strong relative overflow-hidden w-[140px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => navigate(`/podcast/${podcast.podcastId}`, { state: { podcastTitle: podcast.title, podcastThumbnail: podcast.thumbnail } })}
          >
            <TrackThumbnail
              thumbnail={podcast.thumbnail}
              title={podcast.title}
              className="aspect-square rounded-xl mb-3"
              iconClassName="w-12 h-12 text-white opacity-50"
            />
            <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{podcast.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{podcast.artist}</p>
            <Button
              size="icon"
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg w-7 h-7"
            >
              <Play className="w-4 h-4 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePodcastSection;