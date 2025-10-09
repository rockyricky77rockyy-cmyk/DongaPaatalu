import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock } from "lucide-react";
import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";
import { useIsMobile } from "@/hooks/use-mobile";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isMobile = useIsMobile();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just navigate to home
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 p-4 sm:p-8">
        <Button
          variant="ghost"
          className="rounded-full px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg font-medium bg-gradient-neon text-primary-foreground hover:opacity-90"
        >
          Home
        </Button>
        <Button variant="ghost" className="text-base sm:text-lg font-medium text-foreground hover:text-primary">
          Browse
        </Button>
        <Button variant="ghost" className="text-base sm:text-lg font-medium text-foreground hover:text-primary">
          Playlists
        </Button>
        <Button variant="ghost" className="text-base sm:text-lg font-medium text-foreground hover:text-primary">
          Library
        </Button>
        <Button variant="ghost" className="text-base sm:text-lg font-medium text-foreground hover:text-primary">
          Profile
        </Button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Left Visualizer */}
        <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 h-64 sm:h-96 hidden md:block">
          <Visualizer barCount={isMobile ? 15 : 30} direction="horizontal" className="h-full" />
        </div>

        {/* Right Visualizer */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 h-64 sm:h-96 hidden md:block">
          <Visualizer barCount={isMobile ? 15 : 30} direction="horizontal" className="h-full" />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 z-10">
          <div className="flex justify-center">
            <NeonLogo size={isMobile ? "medium" : "large"} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="relative">
              <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Sans Srovie"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 bg-card border-2 border-primary/30 rounded-xl sm:rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:shadow-neon"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-secondary w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="password"
                placeholder="Libbranis"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 bg-card border-2 border-secondary/30 rounded-xl sm:rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-secondary focus:shadow-neon"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 sm:h-14 rounded-full text-lg sm:text-xl font-semibold bg-gradient-neon hover:opacity-90 text-foreground shadow-neon-strong transition-all"
            >
              Login
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Visualizer */}
      <div className="h-20 sm:h-32 px-4 sm:px-8">
        <Visualizer barCount={isMobile ? 30 : 60} direction="horizontal" className="h-full justify-center" />
      </div>
    </div>
  );
};

export default Login;