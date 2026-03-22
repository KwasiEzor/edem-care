"use client";

import { useState } from "react";
import type { AdminSettings, QuickReply } from "@/lib/settings";
import { DAYS_OF_WEEK, DAY_LABELS } from "@/lib/settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  CalendarDays,
  Bot,
  MessageCircle,
  Bell,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Copy,
  ShieldAlert,
  Clock,
  Zap,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export interface WhatsAppStatus {
  connected: boolean;
  webhookUrl: string;
}

interface SettingsFormProps {
  initialSettings: AdminSettings;
  whatsappStatus?: WhatsAppStatus;
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

const MODEL_OPTIONS: Record<string, { label: string; value: string }[]> = {
  anthropic: [
    { label: "Claude 3.5 Sonnet (Conseillé)", value: "claude-3-5-sonnet-20241022" },
    { label: "Claude 3 Opus (Puissant)", value: "claude-3-opus-20240229" },
    { label: "Claude 3 Haiku (Rapide)", value: "claude-3-haiku-20240307" },
  ],
  openai: [
    { label: "GPT-4o (Conseillé)", value: "gpt-4o" },
    { label: "GPT-4o mini (Économique/Rapide)", value: "gpt-4o-mini" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  ],
  google: [
    { label: "Gemini 1.5 Flash (Rapide)", value: "gemini-1.5-flash" },
    { label: "Gemini 1.5 Pro (Puissant)", value: "gemini-1.5-pro" },
  ],
};

export function SettingsForm({ initialSettings, whatsappStatus }: SettingsFormProps) {
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [saving, setSaving] = useState<string | null>(null);

  const update = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      
      // Auto-update model if provider changes to a valid default for that provider
      if (key === "chatbot_provider") {
        const provider = value as string;
        if (provider === "anthropic") next.chatbot_model = "claude-3-5-sonnet-20241022";
        if (provider === "openai") next.chatbot_model = "gpt-4o";
        if (provider === "google") next.chatbot_model = "gemini-1.5-flash";
      }
      
      return next;
    });
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
              <FieldRow label="N° INAMI" htmlFor="business_inami">
                <Input
                  id="business_inami"
                  value={settings.business_inami ?? ""}
                  onChange={(e) => update("business_inami", e.target.value || null)}
                  placeholder="X-XXXXX-XX-XXX"
                />
              </FieldRow>
              <FieldRow label="N° BCE" htmlFor="business_bce">
                <Input
                  id="business_bce"
                  value={settings.business_bce ?? ""}
                  onChange={(e) => update("business_bce", e.target.value || null)}
                  placeholder="XXXX.XXX.XXX"
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
                  business_inami: settings.business_inami,
                  business_bce: settings.business_bce,
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
              <FieldRow
                label="Fournisseur d'IA"
                htmlFor="chatbot_provider"
                description="Le service cloud utilisé (avec repli automatique en cas de panne)"
              >
                <Select
                  value={settings.chatbot_provider}
                  onValueChange={(v) => { if (v) update("chatbot_provider", v as AdminSettings["chatbot_provider"]); }}
                >
                  <SelectTrigger id="chatbot_provider" className="w-full">
                    <SelectValue placeholder="Choisir un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="google">Google (Gemini)</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow
                label="Modèle d'IA"
                htmlFor="chatbot_model"
                description="Le modèle spécifique utilisé pour les réponses"
              >
                <Select
                  value={settings.chatbot_model}
                  onValueChange={(v) => { if (v) update("chatbot_model", v); }}
                >
                  <SelectTrigger id="chatbot_model" className="w-full">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {(MODEL_OPTIONS[settings.chatbot_provider] || []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
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
                  rows={12}
                  className="text-xs leading-relaxed max-h-[350px] overflow-y-auto"
                />
              </div>
            </div>
            <SaveButton
              loading={saving === "chatbot"}
              onClick={() =>
                handleSave("chatbot", {
                  chatbot_enabled: settings.chatbot_enabled,
                  chatbot_provider: settings.chatbot_provider,
                  chatbot_model: settings.chatbot_model,
                  chatbot_system_prompt: settings.chatbot_system_prompt,
                })
              }
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* WhatsApp */}
      <TabsContent value="whatsapp">
        <div className="space-y-6">
          {/* Connection Status */}
          {whatsappStatus && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {whatsappStatus.connected ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {whatsappStatus.connected
                        ? "WhatsApp Business connecté"
                        : "WhatsApp Business non configuré"}
                    </p>
                    <p className="text-xs text-muted-custom">
                      {whatsappStatus.connected
                        ? "Les variables d'environnement sont configurées"
                        : "Configurez WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID"}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-muted-custom max-w-[280px] truncate">
                      {whatsappStatus.webhookUrl}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(whatsappStatus.webhookUrl);
                        toast.success("URL copiée");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages automatiques */}
          <Card>
            <CardContent className="p-6">
              <SectionHeader
                icon={MessageCircle}
                title="Messages automatiques"
                description="Gestion de l'IA et des messages automatiques"
              />
              <div className="space-y-6">
                <SwitchRow
                  label="Réponse IA automatique"
                  description="L'IA répond automatiquement aux nouvelles conversations. Vous pouvez toujours prendre le contrôle manuellement."
                  checked={settings.whatsapp_ai_auto_reply}
                  onCheckedChange={(v) => update("whatsapp_ai_auto_reply", v)}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Message de bienvenue</Label>
                  <p className="text-xs text-muted-custom">
                    Envoyé automatiquement lors du premier message d&apos;un nouveau contact
                  </p>
                  <Textarea
                    value={settings.whatsapp_welcome_message}
                    onChange={(e) => update("whatsapp_welcome_message", e.target.value)}
                    rows={3}
                    className="text-xs"
                  />
                </div>
                <Separator />
                <SwitchRow
                  label="Horaires d'ouverture"
                  description="Envoyer un message d'absence en dehors des heures configurées"
                  checked={settings.whatsapp_business_hours_enabled}
                  onCheckedChange={(v) => update("whatsapp_business_hours_enabled", v)}
                />
                {settings.whatsapp_business_hours_enabled && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Message d&apos;absence</Label>
                    <Textarea
                      value={settings.whatsapp_away_message}
                      onChange={(e) => update("whatsapp_away_message", e.target.value)}
                      rows={3}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
              <SaveButton
                loading={saving === "whatsapp-messages"}
                onClick={() =>
                  handleSave("whatsapp-messages", {
                    whatsapp_ai_auto_reply: settings.whatsapp_ai_auto_reply,
                    whatsapp_welcome_message: settings.whatsapp_welcome_message,
                    whatsapp_away_message: settings.whatsapp_away_message,
                    whatsapp_business_hours_enabled: settings.whatsapp_business_hours_enabled,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* Business Hours */}
          {settings.whatsapp_business_hours_enabled && (
            <Card>
              <CardContent className="p-6">
                <SectionHeader
                  icon={Clock}
                  title="Horaires d'ouverture"
                  description="Fuseau horaire : Europe/Bruxelles"
                />
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const dh = settings.whatsapp_business_hours[day];
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-3 py-1"
                      >
                        <Switch
                          size="sm"
                          checked={dh.enabled}
                          onCheckedChange={(v) => {
                            const updated = { ...settings.whatsapp_business_hours };
                            updated[day] = { ...dh, enabled: v };
                            update("whatsapp_business_hours", updated);
                          }}
                        />
                        <span className="text-sm font-medium w-20 text-ink">
                          {DAY_LABELS[day]}
                        </span>
                        {dh.enabled ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={dh.start}
                              onChange={(e) => {
                                const updated = { ...settings.whatsapp_business_hours };
                                updated[day] = { ...dh, start: e.target.value };
                                update("whatsapp_business_hours", updated);
                              }}
                              className="w-28 text-xs"
                            />
                            <span className="text-xs text-muted-custom">à</span>
                            <Input
                              type="time"
                              value={dh.end}
                              onChange={(e) => {
                                const updated = { ...settings.whatsapp_business_hours };
                                updated[day] = { ...dh, end: e.target.value };
                                update("whatsapp_business_hours", updated);
                              }}
                              className="w-28 text-xs"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-custom italic">Fermé</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <SaveButton
                  loading={saving === "whatsapp-hours"}
                  onClick={() =>
                    handleSave("whatsapp-hours", {
                      whatsapp_business_hours: settings.whatsapp_business_hours,
                    })
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Sécurité & Escalade */}
          <Card>
            <CardContent className="p-6">
              <SectionHeader
                icon={ShieldAlert}
                title="Sécurité & Escalade"
                description="Règles de détection pour désactiver l'IA et alerter l'admin"
              />
              <div className="space-y-6">
                <FieldRow
                  label="Max messages IA"
                  htmlFor="max_ai_msgs"
                  description="Nombre maximum de réponses IA avant de suggérer un contact humain (1–50)"
                >
                  <Input
                    id="max_ai_msgs"
                    type="number"
                    min={1}
                    max={50}
                    value={settings.whatsapp_max_ai_messages}
                    onChange={(e) =>
                      update(
                        "whatsapp_max_ai_messages",
                        Math.max(1, Math.min(50, parseInt(e.target.value) || 10))
                      )
                    }
                    className="w-20"
                  />
                </FieldRow>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mots-clés d&apos;escalade</Label>
                  <p className="text-xs text-muted-custom">
                    Si un patient utilise ces mots, l&apos;IA est désactivée et vous êtes alerté
                  </p>
                  <KeywordInput
                    keywords={settings.whatsapp_escalation_keywords}
                    onChange={(kws) => update("whatsapp_escalation_keywords", kws)}
                  />
                </div>
              </div>
              <SaveButton
                loading={saving === "whatsapp-escalation"}
                onClick={() =>
                  handleSave("whatsapp-escalation", {
                    whatsapp_max_ai_messages: settings.whatsapp_max_ai_messages,
                    whatsapp_escalation_keywords: settings.whatsapp_escalation_keywords,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* Réponses rapides */}
          <Card>
            <CardContent className="p-6">
              <SectionHeader
                icon={Zap}
                title="Réponses rapides"
                description="Messages pré-enregistrés pour répondre rapidement depuis l'inbox"
              />
              <QuickRepliesEditor
                replies={settings.whatsapp_quick_replies}
                onChange={(replies) => update("whatsapp_quick_replies", replies)}
              />
              <SaveButton
                loading={saving === "whatsapp-replies"}
                onClick={() =>
                  handleSave("whatsapp-replies", {
                    whatsapp_quick_replies: settings.whatsapp_quick_replies,
                  })
                }
              />
            </CardContent>
          </Card>
        </div>
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

        <Card className="mt-6">
          <CardContent className="p-6">
            <SectionHeader
              icon={Send}
              title="Notifications patients"
              description="Canaux de notification pour les patients lors des changements de rendez-vous"
            />
            <div className="space-y-5">
              <SwitchRow
                label="Email patient"
                description="Envoyer un email au patient pour chaque changement de statut de rendez-vous"
                checked={settings.patient_notify_email}
                onCheckedChange={(v) => update("patient_notify_email", v)}
              />
              <SwitchRow
                label="WhatsApp patient"
                description="Envoyer un message WhatsApp au patient (nécessite WhatsApp Business configuré)"
                checked={settings.patient_notify_whatsapp}
                onCheckedChange={(v) => update("patient_notify_whatsapp", v)}
              />
            </div>
            <SaveButton
              loading={saving === "patient-notifications"}
              onClick={() =>
                handleSave("patient-notifications", {
                  patient_notify_email: settings.patient_notify_email,
                  patient_notify_whatsapp: settings.patient_notify_whatsapp,
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

function KeywordInput({
  keywords,
  onChange,
}: {
  keywords: string[];
  onChange: (keywords: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addKeyword = () => {
    const kw = input.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      onChange([...keywords, kw]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200"
          >
            {kw}
            <button
              type="button"
              onClick={() => onChange(keywords.filter((k) => k !== kw))}
              className="hover:text-red-900"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addKeyword();
            }
          }}
          placeholder="Ajouter un mot-clé..."
          className="text-xs"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={addKeyword}
          disabled={!input.trim()}
          className="shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function QuickRepliesEditor({
  replies,
  onChange,
}: {
  replies: QuickReply[];
  onChange: (replies: QuickReply[]) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const addReply = () => {
    if (newLabel.trim() && newMessage.trim()) {
      onChange([...replies, { label: newLabel.trim(), message: newMessage.trim() }]);
      setNewLabel("");
      setNewMessage("");
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-3">
      {replies.length === 0 && !showAdd && (
        <p className="text-xs text-muted-custom italic py-2">
          Aucune réponse rapide configurée
        </p>
      )}
      {replies.map((reply, i) => (
        <div
          key={i}
          className="rounded-lg border border-border p-3 space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest">
              {reply.label}
            </span>
            <button
              type="button"
              onClick={() => onChange(replies.filter((_, idx) => idx !== i))}
              className="text-muted-custom hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-custom line-clamp-2">{reply.message}</p>
        </div>
      ))}
      {showAdd ? (
        <div className="rounded-lg border-2 border-dashed border-forest/20 p-3 space-y-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Libellé (ex: Confirmation RDV)"
            className="text-xs"
          />
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message complet..."
            rows={3}
            className="text-xs"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setShowAdd(false);
                setNewLabel("");
                setNewMessage("");
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="text-xs bg-forest text-white hover:bg-forest/90"
              onClick={addReply}
              disabled={!newLabel.trim() || !newMessage.trim()}
            >
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Ajouter une réponse rapide
        </Button>
      )}
    </div>
  );
}
