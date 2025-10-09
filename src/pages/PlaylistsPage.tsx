import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, List } from 'lucide-react';
import Player from '@/components/Player';

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const playlists = [
    { name: "Morning Chill", trackCount: 25, coverColor: "from-blue-400 to-cyan-500" },
    { name: "Workout Beats", trackCount: 18, coverColor: "from-purple-500 to-pink-600" },
    { name: "Focus Flow", trackCount: 30, coverColor: "from-green-500 to-blue-500" },
    { name: "Evening Vibes", trackCount: 22, coverColor: "from-orange-400 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8 pb-[120px]"> {/* Added bottom padding */}
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Playlists</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-xl p-6 shadow-card border border-border flex items-center gap-4">
              <div className={`w-16 h-16 rounded-md bg-gradient-to-br ${playlist.coverColor} flex items-center justify-center flex-shrink-0`}>
                <List className="w-8 h-8 text-white opacity-70" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{playlist.name}</h2>
                <p className="text-muted-foreground text-sm">{playlist.trackCount} tracks</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Player />
    </div>
  );
};

export default PlaylistsPage;