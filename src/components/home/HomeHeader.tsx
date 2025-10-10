import React, { useState, forwardRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HomeHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setShowSuggestions: (show: boolean) => void;
}

const HomeHeader = forwardRef<HTMLDivElement, HomeHeaderProps>(({ searchTerm, setSearchTerm, setShowSuggestions }, ref) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  return (
    <div ref={ref} className="sticky top-0 z-20 bg-background p-4 sm:p-8 border-b border-border hidden lg:block min-h-[4.5rem] lg:min-h-[6.5rem]">
      <div className="relative"> {/* New wrapper for input and icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search music, artists, albums..."
          className="pl-10 bg-input border-border rounded-lg h-10 text-sm w-full" {/* Added w-full */}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(searchTerm.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
      </div>
      {/* Suggestions are rendered in Home.tsx */}
    </div>
  );
});

HomeHeader.displayName = 'HomeHeader';

export default HomeHeader;