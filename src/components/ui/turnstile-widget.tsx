"use client";

import { useState } from "react";
import { Turnstile, type TurnstileProps } from "@marsidev/react-turnstile";
import { env } from "@/lib/env";
import { ShieldCheck, ShieldAlert, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TurnstileWidgetProps extends Omit<TurnstileProps, "siteKey"> {
  onSuccess?: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string | Error) => void;
}

type Status = "idle" | "verifying" | "success" | "error" | "expired";

export function TurnstileWidget({ onSuccess, onExpire, onError, ...props }: TurnstileWidgetProps) {
  const [status, setStatus] = useState<Status>("idle");
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Turnstile site key missing. Check your .env file.");
    }
    return null;
  }

  const handleSuccess = (token: string) => {
    setStatus("success");
    onSuccess?.(token);
  };

  const handleExpire = () => {
    setStatus("expired");
    onExpire?.();
  };

  const handleError = (err: string | Error) => {
    setStatus("error");
    onError?.(err);
  };

  const handleWidgetLoad = () => {
    setStatus("verifying");
  };

  return (
    <div className="flex flex-col items-center gap-3 my-6 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 transition-all">
      <div className="flex items-center gap-2 mb-1">
        {status === "idle" && (
          <>
            <Shield className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Protection anti-robot</span>
          </>
        )}
        {status === "verifying" && (
          <>
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-xs font-medium text-blue-600">Vérification en cours...</span>
          </>
        )}
        {status === "success" && (
          <>
            <ShieldCheck className="h-4 w-4 text-forest" />
            <span className="text-xs font-medium text-forest">Identité vérifiée</span>
          </>
        )}
        {status === "expired" && (
          <>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">Session expirée, merci de re-valider</span>
          </>
        )}
        {status === "error" && (
          <>
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">Échec de la vérification</span>
          </>
        )}
      </div>

      <div className={cn(
        "transition-opacity duration-300",
        status === "success" ? "opacity-20 pointer-events-none" : "opacity-100"
      )}>
        <Turnstile
          siteKey={siteKey}
          onSuccess={handleSuccess}
          onExpire={handleExpire}
          onError={handleError}
          onWidgetLoad={handleWidgetLoad}
          options={{
            theme: "light",
            size: "normal",
          }}
          {...props}
        />
      </div>
      
      {status === "success" && (
        <p className="text-[10px] text-slate-400 -mt-1 italic">
          Vérification réussie avec Cloudflare Turnstile
        </p>
      )}
    </div>
  );
}
