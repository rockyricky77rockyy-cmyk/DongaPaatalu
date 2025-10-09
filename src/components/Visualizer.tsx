import { useEffect, useState, useRef } from "react";

interface VisualizerProps {
  barCount?: number;
  direction?: "horizontal" | "vertical";
  className?: string;
  isPlaying?: boolean; // New prop to control animation
}

const Visualizer = ({ barCount = 40, direction = "horizontal", className = "", isPlaying = false }: VisualizerProps) => {
  const [bars, setBars] = useState<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const generateBars = () => {
    if (isPlaying) {
      // More dynamic and varied bar heights when playing
      const newBars = Array.from({ length: barCount }, () => {
        // Generate a random height between 30% and 80% for a more active look
        return Math.random() * (80 - 30) + 30; 
      });
      setBars(newBars);
    } else {
      // When not playing, bars are static and low
      setBars(Array.from({ length: barCount }, () => 10)); // Static 10% height
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        generateBars(); // Generate dynamic bars
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // When not playing, set static bars once and stop animation
      generateBars();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null; // Clear the ref
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [barCount, isPlaying]); // isPlaying is a dependency

  return (
    <div className={`flex ${direction === "horizontal" ? "items-end gap-1" : "flex-col justify-center gap-1"} ${className}`}>
      {bars.map((height, i) => {
        const colorProgress = i / barCount;
        const gradientColor = colorProgress < 0.5 
          ? `hsl(${188 + colorProgress * 124}, 100%, 50%)`
          : `hsl(${250 + (colorProgress - 0.5) * 60}, 100%, ${50 + colorProgress * 10}%)`;
        
        return (
          <div
            key={i}
            className={`bg-gradient-to-t ${direction === "horizontal" ? "w-1.5" : "h-1.5 w-full"} transition-all duration-200 rounded-full`}
            style={{
              [direction === "horizontal" ? "height" : "width"]: `${height}%`,
              backgroundColor: gradientColor,
              boxShadow: `0 0 10px ${gradientColor}`,
            }}
          />
        );
      })}
    </div>
  );
};

export default Visualizer;