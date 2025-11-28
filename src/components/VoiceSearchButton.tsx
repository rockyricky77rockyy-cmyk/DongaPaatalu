import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  className?: string;
}

// Define SpeechRecognition types for better TypeScript support
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const VoiceSearchButton = ({ onResult, className }: VoiceSearchButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser.");
      // Optionally show a persistent toast or disable the button
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Listen for a single phrase
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'en-US'; // Default language

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
      toastIdRef.current = toast.loading("Listening for your command...", {
        duration: 0, // Indefinite duration
        position: 'top-center',
      });
      console.log("Voice recognition started.");
    };

    recognition.onresult = (event) => {
      setIsListening(false);
      setIsProcessing(true);
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      console.log("Voice recognition result:", transcript);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      toast.success("Voice command recognized!", {
        description: `Searching for: "${transcript}"`,
        duration: 3000,
        position: 'top-center',
      });
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setIsProcessing(false);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      console.error("Speech recognition error:", event.error);
      let errorMessage = "Voice search failed.";
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        errorMessage = "Microphone access denied. Please enable it in your browser settings.";
      } else if (event.error === 'no-speech') {
        errorMessage = "No speech detected. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "Microphone not found or busy.";
      }
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      console.log("Voice recognition ended.");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice search is not supported in your browser.", {
        duration: 5000,
        position: 'top-center',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.error("Error starting speech recognition:", e);
        if (e.name === 'InvalidStateError') {
          // This can happen if start is called while already listening or in a bad state
          recognitionRef.current.stop(); // Try to stop first
          setTimeout(() => {
            try {
              recognitionRef.current?.start(); // Then try to start again
            } catch (retryError: any) {
              toast.error("Failed to start voice search. Please try again.", {
                description: retryError.message,
                duration: 5000,
                position: 'top-center',
              });
            }
          }, 100);
        } else {
          toast.error("Failed to start voice search. Please try again.", {
            description: e.message,
            duration: 5000,
            position: 'top-center',
          });
        }
      }
    }
  };

  const Icon = isListening || isProcessing ? Loader : Mic;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={cn(
        "w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground hover:text-primary transition-colors",
        (isListening || isProcessing) && "animate-spin-slow text-primary"
      )}
      disabled={!recognitionRef.current}
    >
      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
      <span className="sr-only">{isListening ? "Stop listening" : "Start voice search"}</span>
    </Button>
  );
};

export default VoiceSearchButton;