"use client";

import { cn } from "@/lib/utils";

interface CookieSettingsButtonProps {
  className?: string;
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(new Event("open-cookie-settings"));
  };

  return (
    <button
      onClick={handleClick}
      className={cn("transition-colors hover:text-white text-left", className)}
    >
      Gestion des cookies
    </button>
  );
}
