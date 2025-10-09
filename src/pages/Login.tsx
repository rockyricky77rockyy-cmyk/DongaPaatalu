import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 relative">
        {/* Left Visualizer */}
        <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 h-64 sm:h-96 hidden md:block">
          <Visualizer barCount={isMobile ? 15 : 30} direction="horizontal" className="h-full" />
        </div>

        {/* Right Visualizer */}
        <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 h-64 sm:h-96 hidden md:block">
          <Visualizer barCount={isMobile ? 15 : 30} direction="horizontal" className="h-full" />
        </div>

        {/* Login Placeholder */}
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 z-10 p-6 bg-card rounded-2xl shadow-neon-strong border border-primary/30 text-center">
          <div className="flex justify-center mb-6">
            <NeonLogo size={isMobile ? "medium" : "large"} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Authentication Removed</h2>
          <p className="text-muted-foreground">The login functionality has been removed as requested.</p>
          <Button onClick={() => navigate('/home')} className="w-full bg-primary text-primary-foreground hover:bg-accent">
            Go to Home
          </Button>
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