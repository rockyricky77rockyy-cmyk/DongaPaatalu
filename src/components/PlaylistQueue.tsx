import { Music, ChevronRight, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  color: string;
}

const tracks: Track[] = [
  { id: 1, title: "Mıuz Luntıntt", artist: "Artisi Arnéct", duration: "3:45", color: "from-blue-600 to-purple-600" },
  { id: 2, title: "Atluntül nhluü", artist: "Emiret mnem", duration: "4:12", color: "from-purple-600 to-pink-600" },
  { id: 3, title: "Mlıøn Gnalxen", artist: "Ķħin²Bejsqiu", duration: "3:28", color: "from-cyan-500 to-blue-600" },
  { id: 4, title: "Zoctnıır", artist: "Lolnım Noinö", duration: "5:01", color: "from-pink-600 to-purple-600" },
  { id: 5, title: "Elona Ivan", artist: "Ølıım Xın", duration: "3:52", color: "from-blue-500 to-cyan-500" },
  { id: 6, title: "Lnylistt", artist: "Søıık Møm", duration: "4:33", color: "from-purple-500 to-blue-500" },
  { id: 7, title: "Vlisc•l.ıer", artist: "Nıınt Yoiın", duration: "3:15", color: "from-cyan-600 to-purple-600" },
  { id: 8, title: "Ólolnzilıina", artist: "Bııtie Oiu", duration: "4:47", color: "from-blue-600 to-pink-600" },
  { id: 9, title: "Çanile Iclliån", artist: "Leünm øric", duration: "3:39", color: "from-cyan-500 to-blue-600" },
  { id: 10, title: "Eüauin", artist: "Äııme Biic", duration: "5:20", color: "from-purple-600 to-cyan-500" },
];

interface PlaylistQueueProps {
  activeTrackId?: number;
  isMobile?: boolean;
}

const PlaylistQueue = ({ activeTrackId = 3, isMobile = false }: PlaylistQueueProps) => {
  return (
    <div className="flex flex-col bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Soru Pejje</h2>
          {!isMobile && <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 sm:pl-10 bg-input border-border rounded-lg sm:rounded-xl h-9 sm:h-10 text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 text-primary bg-primary/10 hover:bg-primary/20 text-sm h-9 sm:h-10"
          >
            Plist
          </Button>
          <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground text-sm h-9 sm:h-10">
            Playlet Plesly
          </Button>
        </div>
      </div>

      {/* Playlist */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer group ${
                track.id === activeTrackId
                  ? 'bg-primary/20 border border-primary/50 shadow-neon'
                  : 'hover:bg-muted/50'
              }`}
            >
              {/* Album Art */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg bg-gradient-to-br ${track.color} flex items-center justify-center flex-shrink-0`}>
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{track.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>

              {/* Duration & Action */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">{track.duration}</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistQueue;