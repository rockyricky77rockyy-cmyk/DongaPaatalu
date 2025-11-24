import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Radio } from 'lucide-react';
import { useRadioStations } from '@/hooks/use-radio-stations';
import { Skeleton } from '@/components/ui/skeleton';

const RadioPage = () => {
  const navigate = useNavigate();
  const { data: radioStations, isLoading, isError, error } = useRadioStations();

  const handleRadioStationClick = (stationName: string) => {
    navigate(`/radio/songs`, { state: { queryName: stationName } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Radio</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-card rounded-xl p-6">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Radio</h1>
          <p className="text-destructive">Error loading radio stations: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Radio</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {radioStations?.map((station) => (
            <div 
              key={station.id} 
              className="group cursor-pointer bg-card rounded-xl p-6 shadow-card border border-border flex items-center gap-4 hover:border-primary/50 hover:shadow-neon"
              onClick={() => handleRadioStationClick(station.name)}
            >
              <Radio className={`w-8 h-8 ${station.icon_color}`} />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{station.name}</h2>
                <p className="text-muted-foreground text-sm">{station.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadioPage;