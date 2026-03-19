"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:max-w-md"
        >
          <div className="rounded-[1.6rem] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">
                  Respect de votre vie privée
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-custom">
                    Ce site utilise uniquement des cookies essentiels au bon
                    fonctionnement du site. Aucun cookie de tracage ou publicitaire
                    n&apos;est utilise.{" "}
                    <Link
                      href="/mentions-legales"
                      className="font-medium text-forest underline underline-offset-4 hover:no-underline"
                    >
                      En savoir plus
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  className="h-10 rounded-full border-slate-300 px-5"
                >
                  Refuser
                </Button>
                <Button
                  size="sm"
                  className="h-10 rounded-full bg-forest px-5 hover:bg-forest/90"
                  onClick={handleAccept}
                >
                  Accepter
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
