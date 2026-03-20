import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

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

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <AdminHeader
        title="Paramètres"
        description="Configuration générale et préférences"
      />

      <SettingsForm initialSettings={settings} />

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
    </>
  );
}
