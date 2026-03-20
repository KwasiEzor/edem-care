# Admin Settings Page — Full Implementation Plan

## Context

The current settings page at `/admin/parametres` is a stub: business info is hardcoded read-only, notification preferences are stored in `useState` (lost on reload), and key app behaviors (booking window, AI chatbot, WhatsApp defaults) are hardcoded across multiple files. The admin needs a real settings page to manage personal info and configure the app's core features, all persisted to the database.

---

## Database Migration

**Single-row config table** — `admin_settings` with `id = 'default'` enforced by CHECK constraint.

```sql
CREATE TABLE admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),

  -- Profil & Cabinet
  business_name TEXT NOT NULL DEFAULT 'Edem-Care',
  business_specialty TEXT NOT NULL DEFAULT 'Soins infirmiers à domicile',
  business_zone TEXT NOT NULL DEFAULT 'Bruxelles et alentours',
  business_phone TEXT NOT NULL DEFAULT '+32 XXX XX XX XX',
  business_email TEXT,
  admin_display_name TEXT,

  -- Rendez-vous
  booking_max_days_ahead INTEGER NOT NULL DEFAULT 60
    CHECK (booking_max_days_ahead BETWEEN 7 AND 180),
  booking_allow_sundays BOOLEAN NOT NULL DEFAULT false,

  -- Chatbot IA
  chatbot_enabled BOOLEAN NOT NULL DEFAULT true,
  chatbot_system_prompt TEXT,

  -- WhatsApp
  whatsapp_ai_auto_reply BOOLEAN NOT NULL DEFAULT true,

  -- Notifications
  notify_email_new_booking BOOLEAN NOT NULL DEFAULT true,
  notify_email_new_contact BOOLEAN NOT NULL DEFAULT true,
  notify_email_booking_reminder BOOLEAN NOT NULL DEFAULT true,
  notify_sound_alerts BOOLEAN NOT NULL DEFAULT false,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO admin_settings (id) VALUES ('default');

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read" ON admin_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth update" ON admin_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

`chatbot_system_prompt = NULL` means "use the hardcoded default in `chat-service.ts`".

---

## Files Overview

| Action | File | Purpose |
|--------|------|---------|
| **New** | `src/lib/settings.ts` | `AdminSettings` type, `DEFAULT_SETTINGS`, `getSettings()` with 30s cache |
| **New** | `src/app/api/admin/settings/route.ts` | GET + PUT API (auth-protected, Zod validated) |
| **New** | `src/components/admin/settings-form.tsx` | Client component: 5-tab form |
| **Modify** | `src/app/admin/(dashboard)/parametres/page.tsx` | Rewrite: stub → server component + `SettingsForm` |
| **Modify** | `src/lib/ai/chat-service.ts` | Read `chatbot_enabled`, `chatbot_system_prompt` from settings |
| **Modify** | `src/app/api/chat/route.ts` | Check `chatbot_enabled`, return 503 if off |
| **Modify** | `src/app/api/booking/route.ts` | Replace hardcoded 60 days + Sunday check with settings |
| **Modify** | `src/components/booking/date-step.tsx` | Accept `maxDays` + `allowSundays` props |
| **Modify** | `src/components/booking/booking-wizard.tsx` | Forward new props to DateStep |
| **Modify** | `src/app/rendez-vous/page.tsx` | Fetch settings, pass to BookingWizard |
| **Modify** | `src/app/actions/contact.ts` | Gate email with `notify_email_new_contact` |
| **Modify** | `src/app/api/webhooks/whatsapp/route.ts` | Use `whatsapp_ai_auto_reply` for new conversations |

---

## Step 1: Settings Module — `src/lib/settings.ts`

- `AdminSettings` interface matching all DB columns
- `DEFAULT_SETTINGS` constant (mirrors DB defaults)
- `getSettings()`: fetch from Supabase with 30-second in-memory cache, fallback to `DEFAULT_SETTINGS` on error
- `invalidateSettingsCache()`: called after PUT to clear cache

---

## Step 2: Settings API — `src/app/api/admin/settings/route.ts`

**GET**: Auth via `createClient()` from `@/lib/supabase/server`, return settings row.

**PUT**: Auth check, Zod partial schema validation (all fields optional), update `admin_settings` where `id = 'default'`, call `invalidateSettingsCache()`, return updated row.

---

## Step 3: Settings Form — `src/components/admin/settings-form.tsx`

5 tabs using existing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` from `src/components/ui/tabs.tsx`:

| Tab | Label | Fields |
|-----|-------|--------|
| `profil` | Profil & Cabinet | `admin_display_name`, `business_name`, `business_specialty`, `business_zone`, `business_phone`, `business_email` — all `Input` |
| `rendez-vous` | Rendez-vous | `booking_max_days_ahead` (number Input, 7–180), `booking_allow_sundays` (Switch) |
| `chatbot` | Chatbot IA | `chatbot_enabled` (Switch), `chatbot_system_prompt` (Textarea + "Réinitialiser" button to clear to null) |
| `whatsapp` | WhatsApp | `whatsapp_ai_auto_reply` (Switch) — default for new conversations |
| `notifications` | Notifications | 4 Switches: `notify_email_new_booking`, `notify_email_new_contact`, `notify_email_booking_reminder`, `notify_sound_alerts` |

Each tab has its own "Enregistrer" save button → `PUT /api/admin/settings` with only that tab's fields. Toast feedback via Sonner.

Reuses: `Card`, `CardContent`, `Input`, `Label`, `Switch`, `Textarea`, `Button`, `Separator` from `src/components/ui/`.

---

## Step 4: Rewrite Settings Page — `src/app/admin/(dashboard)/parametres/page.tsx`

Remove `"use client"`. Convert to async server component:
- Fetch settings via `getSettings()`
- Render `AdminHeader` + `<SettingsForm initialSettings={settings} />`
- Keep the quick links section below the form

---

## Step 5: Wire Settings into Consumers

### 5a. AI Chatbot — `src/lib/ai/chat-service.ts`
- Call `getSettings()` inside `generateAIResponse()`
- Use `settings.chatbot_system_prompt ?? SYSTEM_PROMPT` for the system param
- Keep hardcoded `SYSTEM_PROMPT` as fallback

### 5b. Chat API — `src/app/api/chat/route.ts`
- Check `settings.chatbot_enabled` before calling `generateAIResponse()`
- If disabled → return `{ error: "Le chatbot est temporairement désactivé" }` with 503

### 5c. Booking API — `src/app/api/booking/route.ts`
- Replace `60` (line 51) with `settings.booking_max_days_ahead`
- Replace Sunday check (line 59) with `if (!settings.booking_allow_sundays && bookingDate.getDay() === 0)`
- Update error messages to use dynamic values

### 5d. Client Booking Flow
- `src/app/rendez-vous/page.tsx`: fetch settings, pass `maxDays` + `allowSundays` as props to `BookingWizard`
- `src/components/booking/booking-wizard.tsx`: accept and forward props to `DateStep`
- `src/components/booking/date-step.tsx`: accept `maxDays` (default 60) + `allowSundays` (default false) props, replace hardcoded values

### 5e. Notification Emails
- `src/app/api/booking/route.ts` (line 112): wrap email block with `if (settings.notify_email_new_booking)`
- `src/app/actions/contact.ts` (line 54): wrap email block with `if (settings.notify_email_new_contact)`

### 5f. WhatsApp Default
- `src/app/api/webhooks/whatsapp/route.ts`: when creating new conversation, set `is_ai_active: settings.whatsapp_ai_auto_reply`

---

## Implementation Order

```
1. DB migration (apply via Supabase MCP)
2. src/lib/settings.ts (types + cache + getSettings)
3. src/app/api/admin/settings/route.ts (GET + PUT)
4. src/components/admin/settings-form.tsx (tabbed UI)
5. src/app/admin/(dashboard)/parametres/page.tsx (rewrite)
6. Wire consumers (Steps 5a–5f)
7. Build verification
```

---

## Verification

1. `npx next build` — 0 errors
2. Settings page loads with 5 tabs, all fields show DB defaults
3. Saving per tab persists to DB and shows success toast
4. Toggling chatbot off → chat widget returns 503
5. Changing `booking_max_days_ahead` → calendar and API both respect new value
6. Toggling `booking_allow_sundays` on → Sundays become selectable
7. Toggling notification emails off → no admin email sent on new booking/contact
8. Custom system prompt reflects in AI responses; "Réinitialiser" reverts to default
