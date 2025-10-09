const NeonLogo = ({ size = "large" }: { size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-24 h-24",
    large: "w-48 h-48",
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center animate-pulse-glow`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(188 100% 50%)" />
            <stop offset="50%" stopColor="hsl(250 100% 60%)" />
            <stop offset="100%" stopColor="hsl(280 100% 50%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M20 20 L20 80 M20 50 L35 50 M35 20 L35 80 M50 20 L50 80 M50 50 L65 50 M65 20 L65 80 M80 20 L80 80"
          stroke="url(#neonGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
};

export default NeonLogo;
