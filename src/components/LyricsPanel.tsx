import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLyrics } from '@/hooks/use-lyrics'; // Import the new hook
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading state

interface LyricsPanelProps {
  videoId: string; // Changed to videoId
  title: string;
  artist: string;
  onClose: () => void;
  currentTime: number; // New prop for current playback time
  duration: number;    // New prop for total track duration
  className?: string;
}

const LyricsPanel = ({ videoId, title, artist, onClose, currentTime, duration, className }: LyricsPanelProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const highlightedLineRef = useRef<HTMLParagraphElement>(null);

  const { data: lyricsContent, isLoading, isError, error } = useLyrics(videoId); // Use videoId to fetch lyrics

  const lyricsLines = lyricsContent ? lyricsContent.trim().split('\n').filter(line => line.trim() !== '') : [];
  const linesCount = lyricsLines.length;
  const lineDuration = duration > 0 ? duration / linesCount : 0;

  // Determine which line should be highlighted based on current time
  const highlightedLineIndex = duration > 0 ? Math.floor(currentTime / lineDuration) : -1;

  useEffect(() => {
    if (highlightedLineRef.current && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollArea) {
        const lineElement = highlightedLineRef.current;
        const lineTop = lineElement.offsetTop;
        const lineHeight = lineElement.offsetHeight;
        const scrollAreaHeight = scrollArea.offsetHeight;

        // Calculate target scroll position to center the highlighted line
        const targetScrollTop = lineTop - (scrollAreaHeight / 2) + (lineHeight / 2);

        scrollArea.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedLineIndex]); // Re-run effect when highlighted line changes

  return (
    <div className={cn(
      "bg-card/50 backdrop-blur-md border border-border rounded-2xl md:rounded-3xl flex flex-col p-4 sm:p-6",
      className
    )}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">Lyrics for "{title}"</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-primary">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4 truncate">by {artist}</p>
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-destructive">Error loading lyrics: {error?.message}</p>
        ) : lyricsLines.length > 0 ? (
          <div className="font-sans text-base leading-relaxed">
            {lyricsLines.map((line, index) => (
              <p
                key={index}
                ref={index === highlightedLineIndex ? highlightedLineRef : null}
                className={cn(
                  "py-1 transition-all duration-300",
                  index === highlightedLineIndex
                    ? "text-primary font-semibold scale-105"
                    : "text-foreground opacity-70"
                )}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No lyrics found for this track.</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default LyricsPanel;