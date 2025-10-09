import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

const Login = () => {
  const isMobile = useIsMobile();
  const { isLoading } = useSession(); // Use isLoading from session context

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NeonLogo size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation - Removed as it's not relevant for a login page */}

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
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 z-10 p-6 bg-card rounded-2xl shadow-neon-strong border border-primary/30">
          <div className="flex justify-center mb-6">
            <NeonLogo size={isMobile ? "medium" : "large"} />
          </div>

          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers for now
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))', // Use your primary color
                    brandAccent: 'hsl(var(--accent))', // Use your accent color
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--primary))',
                    inputBorderFocus: 'hsl(var(--primary))',
                    inputText: 'hsl(var(--foreground))',
                    defaultButtonBackground: 'hsl(var(--primary))',
                    defaultButtonBackgroundHover: 'hsl(var(--accent))',
                    defaultButtonBorder: 'hsl(var(--primary))',
                    defaultButtonText: 'hsl(var(--primary-foreground))',
                    anchorText: 'hsl(var(--primary))',
                    anchorTextHover: 'hsl(var(--accent))',
                  },
                },
              },
            }}
            theme="dark" // Using dark theme to match your app's aesthetic
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email Address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign In',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign In',
                },
                sign_up: {
                  email_label: 'Email Address',
                  password_label: 'Create a Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign Up',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Don\'t have an account? Sign Up',
                },
                forgotten_password: {
                  email_label: 'Email Address',
                  password_label: 'Your Password',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send reset password instructions',
                  link_text: 'Forgot your password?',
                },
                update_password: {
                  password_label: 'New Password',
                  password_input_placeholder: 'Your new password',
                  button_label: 'Update Password',
                },
              },
            }}
          />
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