"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Building2,
  Bell,
  CalendarDays,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const quickLinks = [
  {
    label: "Rendez-vous",
    href: "/admin/rendez-vous",
    icon: CalendarDays,
    description: "Gérer les demandes",
  },
  {
    label: "Disponibilités",
    href: "/admin/disponibilites",
    icon: Clock,
    description: "Créneaux et jours bloqués",
  },
  {
    label: "Patients",
    href: "/admin/patients",
    icon: Users,
    description: "Base de données patients",
  },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({
    emailNewBooking: true,
    emailNewContact: true,
    emailBookingReminder: true,
    soundNotifications: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Préférence mise à jour");
  };

  return (
    <PageTransition>
      <AdminHeader
        title="Paramètres"
        description="Configuration générale et préférences"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10">
                <Building2 className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-ink">
                  Informations du cabinet
                </h3>
                <p className="text-xs text-muted-custom">
                  Données affichées sur le site
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-custom">Nom</span>
                <span className="font-medium text-ink">Edem-Care</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-custom">Spécialité</span>
                <span className="font-medium text-ink">
                  Soins infirmiers à domicile
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-custom">Zone</span>
                <span className="font-medium text-ink">
                  Bruxelles et alentours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-custom">Téléphone</span>
                <span className="font-medium text-ink">+32 XXX XX XX XX</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification preferences */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10">
                <Bell className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-ink">
                  Notifications
                </h3>
                <p className="text-xs text-muted-custom">
                  Préférences de notification
                </p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Nouveau rendez-vous
                  </Label>
                  <p className="text-xs text-muted-custom">
                    Email à chaque nouvelle demande
                  </p>
                </div>
                <Switch
                  checked={prefs.emailNewBooking}
                  onCheckedChange={() => toggle("emailNewBooking")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Nouveau contact
                  </Label>
                  <p className="text-xs text-muted-custom">
                    Email à chaque message du formulaire
                  </p>
                </div>
                <Switch
                  checked={prefs.emailNewContact}
                  onCheckedChange={() => toggle("emailNewContact")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Rappels de RDV
                  </Label>
                  <p className="text-xs text-muted-custom">
                    Rappel la veille de chaque rendez-vous
                  </p>
                </div>
                <Switch
                  checked={prefs.emailBookingReminder}
                  onCheckedChange={() => toggle("emailBookingReminder")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Sons de notification
                  </Label>
                  <p className="text-xs text-muted-custom">
                    Alerte sonore en temps réel
                  </p>
                </div>
                <Switch
                  checked={prefs.soundNotifications}
                  onCheckedChange={() => toggle("soundNotifications")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <h3 className="font-heading text-lg font-semibold text-ink mb-4">
          Accès rapide
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="transition-colors hover:border-forest/30 hover:bg-forest/5 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest/10">
                    <link.icon className="h-5 w-5 text-forest" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-custom">
                      {link.description}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-custom shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
