import { useEffect, useState, useRef } from "react";

interface VisualizerProps {
  barCount?: number;
  direction?: "horizontal" | "vertical";
  className?: string;
}

const Visualizer = ({ barCount = 40, direction = "horizontal", className = "" }: VisualizerProps) => {
  const [bars, setBars] = useState<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const generateBars = () => {
    const newBars = Array.from({ length: barCount }, () => Math.random() * 100);
    setBars(newBars);
  };

  useEffect(() => {
    const animate = () => {
      generateBars();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [barCount]);

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