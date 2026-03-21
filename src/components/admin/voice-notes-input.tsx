"use client";

import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceNotesInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceNotesInput({ onTranscript, className }: VoiceNotesInputProps) {
  const [isListening, setIsVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      toast.error("La dictée vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsVisible(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsVisible(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsVisible(false);
        toast.error("Une erreur est survenue lors de la dictée.");
      };

      recognition.onend = () => {
        setIsVisible(false);
      };
    } else {
      recognition.stop();
      setIsVisible(false);
    }
  }, [isListening, isSupported, onTranscript]);

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={cn(
        "h-8 w-8 rounded-full transition-all",
        isListening ? "bg-red-50 text-red-600 animate-pulse" : "text-muted-custom hover:text-forest",
        className
      )}
      title={isListening ? "Arrêter l'écoute" : "Démarrer la dictée vocale"}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
