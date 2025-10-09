import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Radio } from 'lucide-react';
import Player from '@/components/Player';

const RadioPage = () => {
  const navigate = useNavigate();
  const radioStations = [
    { name: "Neon Waves FM", genre: "Synthwave", iconColor: "text-neon-cyan" },
    { name: "Chill Beats Radio", genre: "Lo-fi Hip Hop", iconColor: "text-neon-purple" },
    { name: "Future Groove", genre: "Funk / Disco", iconColor: "text-neon-pink" },
    { name: "Ambient Dreams", genre: "Ambient", iconColor: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8 pb-[120px]"> {/* Added bottom padding */}
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Radio</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {radioStations.map((station, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-card border border-border flex items-center gap-4">
              <Radio className={`w-8 h-8 ${station.iconColor}`} />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{station.name}</h2>
                <p className="text-muted-foreground text-sm">{station.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Player />
    </div>
  );
};

export default RadioPage;