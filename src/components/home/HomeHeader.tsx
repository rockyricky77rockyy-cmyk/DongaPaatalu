import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useYouTubeMusicSuggestions } from '@/hooks/use-youtube-music';

interface HomeHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const HomeHeader = ({ searchTerm, setSearchTerm }: HomeHeaderProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: suggestions, isLoading: isLoadingSuggestions } = useYouTubeMusicSuggestions(searchTerm);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative p-4 sm:p-8 bg-background border-b border-border hidden lg:block">
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search music, artists, albums..."
        className="pl-10 bg-input border-border rounded-lg h-10 text-sm"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(searchTerm.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      />
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <ScrollArea className="absolute z-50 w-[calc(100%-4rem)] top-full left-8 right-8 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 cursor-pointer hover:bg-muted text-foreground text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default HomeHeader;