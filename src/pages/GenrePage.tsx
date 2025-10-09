import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic2 } from 'lucide-react';
import Player from '@/components/Player';

const GenrePage = () => {
  const navigate = useNavigate();
  const genres = [
    { name: "Electronic", color: "bg-neon-cyan" },
    { name: "Synthwave", color: "bg-neon-purple" },
    { name: "Chillwave", color: "bg-neon-pink" },
    { name: "Vaporwave", color: "bg-blue-500" },
    { name: "Ambient", color: "bg-green-500" },
    { name: "Lo-fi", color: "bg-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8 pb-[120px]"> {/* Added bottom padding */}
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Genres</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {genres.map((genre, i) => (
            <div key={i} className={`group cursor-pointer ${genre.color} rounded-xl p-6 text-center shadow-card border border-border hover:border-primary/50 hover:shadow-neon`}>
              <Mic2 className="w-12 h-12 text-white opacity-70 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white">{genre.name}</h2>
            </div>
          ))}
        </div>
      </div>
      <Player />
    </div>
  );
};

export default GenrePage;