import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface EqualizerControlsProps {
  className?: string;
}

const EqualizerControls = ({ className }: EqualizerControlsProps) => {
  const [bass, setBass] = useState(50);
  const [mids, setMids] = useState(50);
  const [treble, setTreble] = useState(50);

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 lg:p-12 space-y-8", className)}>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Equalizer</h2>
      <p className="text-muted-foreground text-center max-w-md">
        (Note: Due to YouTube API limitations, these controls are for visual representation only and do not affect actual audio output.)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-lg">
        <div className="flex flex-col items-center space-y-4">
          <span className="text-lg font-semibold text-foreground">Bass</span>
          <Slider
            orientation="vertical"
            min={0}
            max={100}
            step={1}
            value={[bass]}
            onValueChange={(val) => setBass(val[0])}
            className="h-48 w-4"
          />
          <span className="text-sm text-muted-foreground">{bass - 50} dB</span>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <span className="text-lg font-semibold text-foreground">Mids</span>
          <Slider
            orientation="vertical"
            min={0}
            max={100}
            step={1}
            value={[mids]}
            onValueChange={(val) => setMids(val[0])}
            className="h-48 w-4"
          />
          <span className="text-sm text-muted-foreground">{mids - 50} dB</span>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <span className="text-lg font-semibold text-foreground">Treble</span>
          <Slider
            orientation="vertical"
            min={0}
            max={100}
            step={1}
            value={[treble]}
            onValueChange={(val) => setTreble(val[0])}
            className="h-48 w-4"
          />
          <span className="text-sm text-muted-foreground">{treble - 50} dB</span>
        </div>
      </div>
    </div>
  );
};

export default EqualizerControls;