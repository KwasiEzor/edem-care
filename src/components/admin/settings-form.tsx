"use client";

import { useState } from "react";
import type { AdminSettings } from "@/lib/settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CalendarDays,
  Bot,
  MessageCircle,
  Bell,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsFormProps {
  initialSettings: AdminSettings;
}

async function saveSettings(data: Partial<AdminSettings>) {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Erreur lors de la sauvegarde");
  }

  return res.json();
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [saving, setSaving] = useState<string | null>(null);

  const update = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (
    tab: string,
    data: Partial<AdminSettings>
  ) => {
    setSaving(tab);
    try {
      const { settings: updated } = await saveSettings(data);
      setSettings((prev) => ({ ...prev, ...updated }));
      toast.success("Paramètres enregistrés");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <Tabs defaultValue="profil">
      <TabsList variant="line" className="mb-6 w-full justify-start gap-2 overflow-x-auto">
        <TabsTrigger value="profil" className="gap-1.5 text-xs sm:text-sm">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">Profil & Cabinet</span>
          <span className="sm:hidden">Profil</span>
        </TabsTrigger>
        <TabsTrigger value="rendez-vous" className="gap-1.5 text-xs sm:text-sm">
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Rendez-vous</span>
          <span className="sm:hidden">RDV</span>
        </TabsTrigger>
        <TabsTrigger value="chatbot" className="gap-1.5 text-xs sm:text-sm">
          <Bot className="h-4 w-4" />
          <span>Chatbot IA</span>
        </TabsTrigger>
        <TabsTrigger value="whatsapp" className="gap-1.5 text-xs sm:text-sm">
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
          <span className="sm:hidden">Notifs</span>
        </TabsTrigger>
      </TabsList>

      {/* Profil & Cabinet */}
      <TabsContent value="profil">
        <Card>
          <CardContent className="p-6">
            <SectionHeader
              icon={Building2}
              title="Profil & Cabinet"
              description="Vos informations personnelles et celles du cabinet"
            />
            <div className="space-y-4">
              <FieldRow label="Nom affiché (admin)" htmlFor="admin_display_name">
                <Input
                  id="admin_display_name"
                  value={settings.admin_display_name ?? ""}
                  onChange={(e) =>
                    update("admin_display_name", e.target.value || null)
                  }
                  placeholder="Votre nom"
                />
              </FieldRow>
              <FieldRow label="Email de contact" htmlFor="business_email">
                <Input
                  id="business_email"
                  type="email"
                  value={settings.business_email ?? ""}
                  onChange={(e) =>
                    update("business_email", e.target.value || null)
                  }
                  placeholder="contact@edem-care.be"
                />
              </FieldRow>
              <Separator />
              <FieldRow label="Nom du cabinet" htmlFor="business_name">
                <Input
                  id="business_name"
                  value={settings.business_name}
                  onChange={(e) => update("business_name", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Spécialité" htmlFor="business_specialty">
                <Input
                  id="business_specialty"
                  value={settings.business_specialty}
                  onChange={(e) => update("business_specialty", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Zone de couverture" htmlFor="business_zone">
                <Input
                  id="business_zone"
                  value={settings.business_zone}
                  onChange={(e) => update("business_zone", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Téléphone" htmlFor="business_phone">
                <Input
                  id="business_phone"
                  value={settings.business_phone}
                  onChange={(e) => update("business_phone", e.target.value)}
                />
              </FieldRow>
            </div>
            <SaveButton
              loading={saving === "profil"}
              onClick={() =>
                handleSave("profil", {
                  admin_display_name: settings.admin_display_name,
                  business_name: settings.business_name,
                  business_specialty: settings.business_specialty,
                  business_zone: settings.business_zone,
                  business_phone: settings.business_phone,
                  business_email: settings.business_email,
                })
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Rendez-vous */}
      <TabsContent value="rendez-vous">
        <Card>
          <CardContent className="p-6">
            <SectionHeader
              icon={CalendarDays}
              title="Rendez-vous"
              description="Configuration du système de prise de rendez-vous"
            />
            <div className="space-y-6">
              <FieldRow
                label="Fenêtre de réservation (jours)"
                htmlFor="booking_max_days"
                description="Nombre maximum de jours à l'avance pour prendre rendez-vous (7–180)"
              >
                <Input
                  id="booking_max_days"
                  type="number"
                  min={7}
                  max={180}
                  value={settings.booking_max_days_ahead}
                  onChange={(e) =>
                    update(
                      "booking_max_days_ahead",
                      Math.max(7, Math.min(180, parseInt(e.target.value) || 60))
                    )
                  }
                  className="w-24"
                />
              </FieldRow>
              <SwitchRow
                label="Autoriser les dimanches"
                description="Permettre aux patients de prendre rendez-vous le dimanche"
                checked={settings.booking_allow_sundays}
                onCheckedChange={(v) => update("booking_allow_sundays", v)}
              />
            </div>
            <SaveButton
              loading={saving === "rendez-vous"}
              onClick={() =>
                handleSave("rendez-vous", {
                  booking_max_days_ahead: settings.booking_max_days_ahead,
                  booking_allow_sundays: settings.booking_allow_sundays,
                })
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Chatbot IA */}
      <TabsContent value="chatbot">
        <Card>
          <CardContent className="p-6">
            <SectionHeader
              icon={Bot}
              title="Chatbot IA"
              description="Configuration de l'assistant virtuel sur le site"
            />
            <div className="space-y-6">
              <SwitchRow
                label="Chatbot activé"
                description="Désactiver le chatbot masquera les réponses IA sur le site"
                checked={settings.chatbot_enabled}
                onCheckedChange={(v) => update("chatbot_enabled", v)}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Prompt système personnalisé
                    </Label>
                    <p className="text-xs text-muted-custom">
                      Laissez vide pour utiliser le prompt par défaut
                    </p>
                  </div>
                  {settings.chatbot_system_prompt !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-custom"
                      onClick={() => update("chatbot_system_prompt", null)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Réinitialiser
                    </Button>
                  )}
                </div>
                <Textarea
                  value={settings.chatbot_system_prompt ?? ""}
                  onChange={(e) =>
                    update(
                      "chatbot_system_prompt",
                      e.target.value || null
                    )
                  }
                  placeholder="Tu es l'assistant virtuel d'Edem-Care, un service de soins infirmiers à domicile à Bruxelles..."
                  rows={8}
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>
            <SaveButton
              loading={saving === "chatbot"}
              onClick={() =>
                handleSave("chatbot", {
                  chatbot_enabled: settings.chatbot_enabled,
                  chatbot_system_prompt: settings.chatbot_system_prompt,
                })
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* WhatsApp */}
      <TabsContent value="whatsapp">
        <Card>
          <CardContent className="p-6">
            <SectionHeader
              icon={MessageCircle}
              title="WhatsApp"
              description="Configuration par défaut des conversations WhatsApp"
            />
            <div className="space-y-6">
              <SwitchRow
                label="Réponse IA automatique"
                description="Quand activé, l'IA répond automatiquement aux nouvelles conversations WhatsApp. Vous pouvez toujours prendre le contrôle manuellement."
                checked={settings.whatsapp_ai_auto_reply}
                onCheckedChange={(v) => update("whatsapp_ai_auto_reply", v)}
              />
            </div>
            <SaveButton
              loading={saving === "whatsapp"}
              onClick={() =>
                handleSave("whatsapp", {
                  whatsapp_ai_auto_reply: settings.whatsapp_ai_auto_reply,
                })
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications */}
      <TabsContent value="notifications">
        <Card>
          <CardContent className="p-6">
            <SectionHeader
              icon={Bell}
              title="Notifications"
              description="Préférences de notification par email et en temps réel"
            />
            <div className="space-y-5">
              <SwitchRow
                label="Nouveau rendez-vous"
                description="Email à chaque nouvelle demande de rendez-vous"
                checked={settings.notify_email_new_booking}
                onCheckedChange={(v) => update("notify_email_new_booking", v)}
              />
              <SwitchRow
                label="Nouveau contact"
                description="Email à chaque message du formulaire de contact"
                checked={settings.notify_email_new_contact}
                onCheckedChange={(v) => update("notify_email_new_contact", v)}
              />
              <SwitchRow
                label="Rappels de RDV"
                description="Rappel la veille de chaque rendez-vous"
                checked={settings.notify_email_booking_reminder}
                onCheckedChange={(v) =>
                  update("notify_email_booking_reminder", v)
                }
              />
              <SwitchRow
                label="Sons de notification"
                description="Alerte sonore en temps réel dans le dashboard"
                checked={settings.notify_sound_alerts}
                onCheckedChange={(v) => update("notify_sound_alerts", v)}
              />
            </div>
            <SaveButton
              loading={saving === "notifications"}
              onClick={() =>
                handleSave("notifications", {
                  notify_email_new_booking: settings.notify_email_new_booking,
                  notify_email_new_contact: settings.notify_email_new_contact,
                  notify_email_booking_reminder:
                    settings.notify_email_booking_reminder,
                  notify_sound_alerts: settings.notify_sound_alerts,
                })
              }
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

/* ─── Sub-components ───────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10">
        <Icon className="h-5 w-5 text-forest" />
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
        <p className="text-xs text-muted-custom">{description}</p>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="shrink-0">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-custom">{description}</p>
        )}
      </div>
      <div className="sm:w-64">{children}</div>
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-custom max-w-md">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SaveButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end">
      <Button
        className="rounded-full bg-forest text-white hover:bg-forest/90"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Enregistrer
      </Button>
    </div>
  );
}
