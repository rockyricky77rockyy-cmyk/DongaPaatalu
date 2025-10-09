import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Headphones } from 'lucide-react';
// import Player from '@/components/Player'; // Removed Player import

const ArtistsPage = () => {
  const navigate = useNavigate();
  const artists = [
    { name: "Artisi Arnéct", genre: "Electronic", avatarColor: "from-blue-600 to-purple-600" },
    { name: "Emiret Mnem", genre: "Synthwave", avatarColor: "from-purple-600 to-pink-600" },
    { name: "Ķħin²Bejsqiu", genre: "Chillwave", avatarColor: "from-cyan-500 to-blue-600" },
    { name: "Lolnım Noinö", genre: "Vaporwave", avatarColor: "from-pink-600 to-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8"> {/* Removed bottom padding */}
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Artists</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <div key={index} className="group cursor-pointer bg-card rounded-2xl p-4 text-center hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${artist.avatarColor} mb-4 flex items-center justify-center`}>
                <Headphones className="w-12 h-12 text-white opacity-50" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{artist.name}</h3>
              <p className="text-sm text-muted-foreground">{artist.genre}</p>
            </div>
          ))}
        </div>
      </div>
      {/* <Player /> Removed Player here */}
    </div>
  );
};

export default ArtistsPage;