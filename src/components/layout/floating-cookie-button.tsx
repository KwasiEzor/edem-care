"use client";

import { motion } from "framer-motion";
import { Cookie } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FloatingCookieButton() {
  const handleClick = () => {
    window.dispatchEvent(new Event("open-cookie-settings"));
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Tooltip>
        <TooltipTrigger
          render={
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClick}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-lg backdrop-blur-sm transition-colors hover:bg-white hover:text-forest"
              aria-label="Paramètres des cookies"
            />
          }
        >
          <Cookie className="h-5 w-5" />
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800">
          <p className="text-xs font-medium">Gestion des cookies</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
