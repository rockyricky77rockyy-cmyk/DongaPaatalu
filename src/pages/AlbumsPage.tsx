import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Disc3 } from 'lucide-react';
import Player from '@/components/Player';

const AlbumsPage = () => {
  const navigate = useNavigate();
  const albums = [
    { title: "Neon Dreams", artist: "Synthwave Collective", color: "from-cyan-500 to-blue-600" },
    { title: "Electric Echoes", artist: "Vaporwave Visions", color: "from-purple-600 to-pink-600" },
    { title: "Starlight Serenade", artist: "Cosmic Harmonies", color: "from-blue-600 to-purple-600" },
    { title: "Future Funk", artist: "Groove Masters", color: "from-pink-600 to-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8 pb-[120px]"> {/* Added bottom padding */}
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Albums</h1>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Changed to flex flex-col on mobile */}
          {albums.map((album, index) => (
            <div key={index} className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon">
              <div className={`aspect-square rounded-xl bg-gradient-to-br ${album.color} mb-4 flex items-center justify-center`}>
                <Disc3 className="w-16 h-16 text-white opacity-50" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{album.title}</h3>
              <p className="text-sm text-muted-foreground">{album.artist}</p>
            </div>
          ))}
        </div>
      </div>
      <Player />
    </div>
  );
};

export default AlbumsPage;