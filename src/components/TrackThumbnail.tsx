import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackThumbnailProps {
  thumbnail?: string;
  title: string;
  color?: string;
  className?: string;
  iconClassName?: string;
}

const TrackThumbnail = ({ thumbnail, title, color, className, iconClassName }: TrackThumbnailProps) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if thumbnail changes
  React.useEffect(() => {
    setHasError(false);
  }, [thumbnail]);

  if (thumbnail && !hasError) {
    return (
      <img
        src={thumbnail}
        alt={title}
        className={cn("object-cover", className)}
        onError={() => setHasError(true)}
      />
    );
  }

  // Fallback UI
  return (
    <div className={cn(
      `bg-gradient-to-br ${color || 'from-gray-600 to-gray-800'} flex items-center justify-center`,
      className
    )}>
      <Music className={cn("text-white opacity-70", iconClassName)} />
    </div>
  );
};

export default TrackThumbnail;