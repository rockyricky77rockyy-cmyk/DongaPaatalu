import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock } from "lucide-react";
import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just navigate to home
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="flex items-center justify-center gap-8 p-8">
        <Button
          variant="ghost"
          className="rounded-full px-8 py-6 text-lg font-medium bg-gradient-neon text-primary-foreground hover:opacity-90"
        >
          Home
        </Button>
        <Button variant="ghost" className="text-lg font-medium text-foreground hover:text-primary">
          Browse
        </Button>
        <Button variant="ghost" className="text-lg font-medium text-foreground hover:text-primary">
          Playlists
        </Button>
        <Button variant="ghost" className="text-lg font-medium text-foreground hover:text-primary">
          Library
        </Button>
        <Button variant="ghost" className="text-lg font-medium text-foreground hover:text-primary">
          Profile
        </Button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Left Visualizer */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 h-96">
          <Visualizer barCount={30} direction="horizontal" className="h-full" />
        </div>

        {/* Right Visualizer */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 h-96">
          <Visualizer barCount={30} direction="horizontal" className="h-full" />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md space-y-8 z-10">
          <div className="flex justify-center">
            <NeonLogo size="large" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
              <Input
                type="text"
                placeholder="Sans Srovie"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-12 h-14 bg-card border-2 border-primary/30 rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:shadow-neon"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
              <Input
                type="password"
                placeholder="Libbranis"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 bg-card border-2 border-secondary/30 rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-secondary focus:shadow-neon"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-full text-xl font-semibold bg-gradient-neon hover:opacity-90 text-foreground shadow-neon-strong transition-all"
            >
              Login
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Visualizer */}
      <div className="h-32 px-8">
        <Visualizer barCount={60} direction="horizontal" className="h-full justify-center" />
      </div>
    </div>
  );
};

export default Login;
