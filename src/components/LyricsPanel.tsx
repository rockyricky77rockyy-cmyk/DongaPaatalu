import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LyricsPanelProps {
  title: string;
  artist: string;
  onClose: () => void;
  className?: string;
}

const LyricsPanel = ({ title, artist, onClose, className }: LyricsPanelProps) => {
  // Placeholder lyrics for demonstration.
  // In a real application, you would fetch these based on title/artist/videoId.
  const placeholderLyrics = `
(Verse 1)
Sunrise paints the window pane, another day begins
A gentle hum, a soft refrain, where my journey spins
Through city streets or quiet lanes, a melody takes hold
Washing away the weary pains, a story to unfold

(Chorus)
Oh, the rhythm of the heart, a beat so strong and true
Playing its essential part, in everything I do
With every note, a brand new start, a feeling fresh and new
Breaking free, tearing apart, the old to make way for you

(Verse 2)
Whispers carried on the breeze, a secret softly told
Dancing through the ancient trees, a spirit brave and bold
Moments caught in time's embrace, like stardust in the air
Finding beauty, finding grace, beyond all worldly care

(Chorus)
Oh, the rhythm of the heart, a beat so strong and true
Playing its essential part, in everything I do
With every note, a brand new start, a feeling fresh and new
Breaking free, tearing apart, the old to make way for you

(Bridge)
Sometimes the tempo slows down low, a quiet, thoughtful pace
Sometimes the fire starts to glow, lighting up this space
Through every high and every low, a constant, steady sound
A guiding light, a gentle flow, where peace can still be found

(Chorus)
Oh, the rhythm of the heart, a beat so strong and true
Playing its essential part, in everything I do
With every note, a brand new start, a feeling fresh and new
Breaking free, tearing apart, the old to make way for you

(Outro)
The music plays, it never ends, a symphony of light
On this journey, with my friends, we dance into the night
`;

  return (
    <div className={cn(
      "absolute inset-0 z-40 bg-card/50 backdrop-blur-md border border-border rounded-2xl md:rounded-3xl flex flex-col p-4 sm:p-6",
      className
    )}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">Lyrics for "{title}"</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-primary">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4 truncate">by {artist}</p>
      <ScrollArea className="flex-1 pr-4"> {/* Added pr-4 for scrollbar space */}
        <pre className="font-sans text-base text-foreground leading-relaxed whitespace-pre-wrap">
          {placeholderLyrics}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default LyricsPanel;