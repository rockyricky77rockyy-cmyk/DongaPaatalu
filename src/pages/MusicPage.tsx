import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Player from '@/components/Player';

const MusicPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Music</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h2 className="text-xl font-semibold text-primary mb-2">Track Title {i + 1}</h2>
              <p className="text-muted-foreground">Artist Name</p>
              <p className="text-sm text-muted-foreground mt-2">A brief description of the track or album.</p>
            </div>
          ))}
        </div>
      </div>
      <Player />
    </div>
  );
};

export default MusicPage;