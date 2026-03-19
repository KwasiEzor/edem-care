"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/a-propos", label: "À propos" },
  { href: "/#confiance", label: "Confiance" },
  { href: "/contact", label: "Contact" },
  { href: "/mon-espace", label: "Mon espace" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8 lg:pt-5">
        <div
          className={`rounded-[1.6rem] border transition-all duration-300 ${
            isScrolled
              ? "border-white/80 bg-white/88 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              : "border-white/55 bg-white/72 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur-lg"
          }`}
        >
          <div className="hidden items-center justify-between border-b border-slate-200/80 px-5 py-2 text-xs text-muted-custom lg:flex">
            <div className="inline-flex items-center gap-2 font-medium text-forest">
              <Sparkles className="h-3.5 w-3.5" />
              Soins infirmiers à domicile à Bruxelles et environs
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+32000000000" className="transition-colors hover:text-forest">
                +32 (0) 000 00 00 00
              </a>
              <Link href="/contact" className="transition-colors hover:text-forest">
                contact@edem-care.be
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0b4da2_0%,#14b8d4_100%)] text-white shadow-lg shadow-cyan-500/20">
                <span className="font-heading text-xl font-semibold">EC</span>
              </div>
              <div>
                <span className="block font-heading text-2xl font-bold leading-none text-forest lg:text-[2rem]">
                  Edem-Care
                </span>
                <span className="mt-1 hidden text-xs uppercase tracking-[0.24em] text-muted-custom sm:block">
                  Soins à domicile
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition-all hover:bg-forest/8 hover:text-forest"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href="tel:+32000000000" />}
                className="h-10 rounded-full border-slate-300 bg-white px-4 text-ink shadow-sm hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" />
                Appeler
              </Button>
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/rendez-vous" />}
                className="h-10 rounded-full bg-forest px-5 text-white shadow-lg shadow-blue-900/15 hover:bg-forest/90"
              >
                Prendre rendez-vous
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-ink shadow-sm transition-colors hover:bg-slate-50 lg:hidden">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] border-l border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-6">
                <SheetTitle className="flex items-center gap-3 font-heading text-2xl text-forest">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest text-lg text-white">
                    EC
                  </span>
                  Edem-Care
                </SheetTitle>
                <div className="mt-8 space-y-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-ink transition-colors hover:border-forest/25 hover:text-forest"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
                <div className="mt-8 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-ink">
                    Besoin d&apos;une reponse rapide ?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-custom">
                    Contactez-nous pour organiser vos soins ou obtenir des renseignements.
                  </p>
                  <div className="mt-4 space-y-3">
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-full border-slate-300 bg-white"
                      nativeButton={false}
                      render={<a href="tel:+32000000000" />}
                    >
                      <Phone className="h-4 w-4" />
                      Appeler
                    </Button>
                    <Button
                      className="h-11 w-full rounded-full bg-forest"
                      nativeButton={false}
                      render={<Link href="/rendez-vous" onClick={() => setIsOpen(false)} />}
                    >
                      Prendre rendez-vous
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
