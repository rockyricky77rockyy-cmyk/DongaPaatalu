import React from 'react';
import { Radio, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRadioStations } from '@/hooks/use-radio-stations';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HomeRadioStationsSectionProps {
  className?: string;
}

const HomeRadioStationsSection = ({ className }: HomeRadioStationsSectionProps) => {
  const navigate = useNavigate();
  const { data: radioStations, isLoading, isError, error } = useRadioStations();

  if (isLoading) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Radio Stations</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-3 flex items-center gap-3 w-[200px] flex-shrink-0 md:w-auto md:flex-shrink">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Radio Stations</h2>
        <p className="text-destructive">Error loading radio stations: {error?.message}</p>
      </div>
    );
  }

  if (!radioStations || radioStations.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-8", className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Radio Stations</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {radioStations.slice(0, 4).map((station) => (
          <div
            key={station.id}
            className="group cursor-pointer bg-card rounded-2xl p-3 shadow-card border border-border flex items-center gap-3 hover:border-primary/50 hover:shadow-neon relative overflow-hidden w-[200px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => navigate('/radio')}
          >
            <Radio className={`w-6 h-6 ${station.icon_color}`} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">{station.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{station.genre}</p>
            </div>
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

export default HomeRadioStationsSection;