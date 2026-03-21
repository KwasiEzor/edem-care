"use client";

import { Turnstile, type TurnstileProps } from "@marsidev/react-turnstile";
import { env } from "@/lib/env";

interface TurnstileWidgetProps extends Omit<TurnstileProps, "siteKey"> {
  onSuccess?: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string | Error) => void;
}

export function TurnstileWidget({ onSuccess, onExpire, onError, ...props }: TurnstileWidgetProps) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    // In dev, if key is missing, don't block the UI
    if (process.env.NODE_ENV === "development") {
      console.warn("Turnstile site key missing. Check your .env file.");
      return null;
    }
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{
          theme: "light",
          size: "normal",
        }}
        {...props}
      />
    </div>
  );
}
