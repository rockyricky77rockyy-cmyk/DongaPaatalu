import React from 'react';
import { Radio, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRadioStations } from '@/hooks/use-radio-stations';
import { useNavigate } from 'react-router-dom';

const HomeRadioStationsSection = () => {
  const navigate = useNavigate();
  const { data: radioStations, isLoading, isError, error } = useRadioStations();

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Radio Stations</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4 flex items-center gap-4 w-[280px] flex-shrink-0 md:w-auto">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Radio Stations</h2>
        <p className="text-destructive">Error loading radio stations: {error?.message}</p>
      </div>
    );
  }

  if (!radioStations || radioStations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Radio Stations</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
        {radioStations.slice(0, 4).map((station) => (
          <div
            key={station.id}
            className="group cursor-pointer bg-card rounded-2xl p-4 shadow-card border border-border flex items-center gap-4 hover:border-primary/50 hover:shadow-neon relative overflow-hidden w-[280px] flex-shrink-0 md:w-auto"
            onClick={() => navigate('/radio')}
          >
            <Radio className={`w-10 h-10 ${station.icon_color}`} />
            <div>
              <h3 className="text-xl font-semibold text-foreground">{station.name}</h3>
              <p className="text-muted-foreground text-sm">{station.genre}</p>
            </div>
            <Button 
              size="icon" 
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeRadioStationsSection;