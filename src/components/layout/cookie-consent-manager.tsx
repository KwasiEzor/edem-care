"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Settings, X, Check, Cookie } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  getStoredConsent,
  setStoredConsent,
  DEFAULT_CONSENT,
  type CookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsentManager() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setConsent(stored);
    }

    // Listen for manual triggers (e.g. from footer)
    const handleTrigger = () => setShowSettings(true);
    window.addEventListener("open-cookie-settings", handleTrigger);
    return () => window.removeEventListener("open-cookie-settings", handleTrigger);
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setStoredConsent(allAccepted);
    setConsent(allAccepted);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const allRejected = { essential: true, analytics: false, marketing: false };
    setStoredConsent(allRejected);
    setConsent(allRejected);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    setStoredConsent(consent);
    setIsVisible(false);
    setShowSettings(false);
  };

  return (
    <>
      {/* Mini Banner */}
      <AnimatePresence>
        {isVisible && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:max-w-lg"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.15)] backdrop-blur-md">
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Cookie className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">
                      Gestion des cookies
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-custom">
                      Nous utilisons des cookies pour améliorer votre expérience. Certains sont indispensables, d&apos;autres nous aident à analyser le trafic.{" "}
                      <Link
                        href="/mentions-legales"
                        className="font-medium text-forest hover:underline"
                      >
                        Politique de confidentialité
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="h-10 rounded-full text-muted-custom"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                    className="h-10 rounded-full border-slate-200"
                  >
                    Refuser tout
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="h-10 rounded-full bg-forest px-6 hover:bg-forest/90"
                  >
                    Tout accepter
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-50 px-5 py-6 sm:px-6 border-b border-slate-100">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-6 w-6 text-forest shrink-0" />
                <DialogTitle className="font-heading text-xl sm:text-2xl">Préférences de confidentialité</DialogTitle>
              </div>
              <DialogDescription className="text-slate-600 text-sm">
                Personnalisez la manière dont nous traitons vos données. Vos choix sont modifiables à tout moment.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-6 sm:px-6 space-y-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
            {/* Essential */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">Cookies essentiels</p>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Requis</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Nécessaires au fonctionnement du site : navigation, authentification et sécurité. Ils ne peuvent pas être désactivés.
                </p>
              </div>
              <Switch checked disabled className="shrink-0 self-start sm:self-auto" />
            </div>

            {/* Analytics */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-forest/20 transition-colors">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Mesure d&apos;audience</p>
                <p className="text-xs text-slate-500 leading-normal">
                  Nous permettent de comprendre comment les visiteurs interagissent avec le site (pages vues, temps passé) afin d&apos;améliorer nos services.
                </p>
              </div>
              <Switch 
                checked={consent.analytics} 
                onCheckedChange={(v) => setConsent(prev => ({ ...prev, analytics: v }))} 
                className="shrink-0 self-start sm:self-auto"
              />
            </div>

            {/* Marketing */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-forest/20 transition-colors">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Marketing & Réseaux sociaux</p>
                <p className="text-xs text-slate-500 leading-normal">
                  Utilisés pour vous proposer des contenus adaptés ou pour permettre le partage sur les réseaux sociaux.
                </p>
              </div>
              <Switch 
                checked={consent.marketing} 
                onCheckedChange={(v) => setConsent(prev => ({ ...prev, marketing: v }))} 
                className="shrink-0 self-start sm:self-auto"
              />
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6 sm:py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-3">
            <Button
              variant="outline"
              className="w-full sm:flex-1 rounded-full h-11 px-2 text-xs sm:text-sm"
              onClick={handleRejectAll}
            >
              Refuser tout
            </Button>
            <Button
              className="w-full sm:flex-1 rounded-full h-11 bg-forest hover:bg-forest/90 px-2 text-xs sm:text-sm"
              onClick={handleSaveSettings}
            >
              Enregistrer mes choix
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:flex-1 rounded-full h-11 px-2 text-xs sm:text-sm"
              onClick={handleAcceptAll}
            >
              Tout accepter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
