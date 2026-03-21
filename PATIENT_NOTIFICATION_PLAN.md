# Patient Booking Notifications — Email + WhatsApp

## Context

Currently, patient notifications are limited: only email-based confirmation/cancellation when the **admin** changes status (in `src/app/api/booking/status/route.ts`). There is **no notification** when a booking is first created, when a patient modifies their own booking, or when a patient cancels. WhatsApp is not used for patient notifications at all. The admin wants patients to receive notifications via **Email** and **WhatsApp** for all key booking lifecycle events, with per-channel toggles in admin settings. SMS is deferred to a later phase.

---

## Notification Events

| Event | Trigger Location | Current Behavior |
|-------|-----------------|-----------------|
| `booking_created` | `POST /api/booking` | Admin email only, no patient notification |
| `booking_confirmed` | `POST /api/booking/status` | Patient email only (inline HTML) |
| `booking_cancelled` | `POST /api/booking/status` + `DELETE /api/patient/bookings` | Patient email for admin cancel; nothing for patient self-cancel |
| `booking_modified` | `PATCH /api/patient/bookings` | No notification at all |

---

## Files Overview

| Action | File | Purpose |
|--------|------|---------|
| **New** | `src/lib/notifications/patient-notifications.ts` | Unified dispatcher: `notifyPatient(ctx)` → fans out to email + WhatsApp |
| **New** | `src/lib/notifications/messages.ts` | French email HTML templates + plain-text templates for all 4 events |
| **Modify** | `src/lib/settings.ts` | Add `patient_notify_email`, `patient_notify_whatsapp` to `AdminSettings` |
| **Modify** | `src/app/api/admin/settings/route.ts` | Add 2 boolean fields to Zod schema |
| **Modify** | `src/app/api/booking/route.ts` | Add `notifyPatient("booking_created")` after insert |
| **Modify** | `src/app/api/booking/status/route.ts` | Replace inline email with `notifyPatient()` call |
| **Modify** | `src/app/api/patient/bookings/route.ts` | Add `notifyPatient("booking_modified")` in PATCH, `notifyPatient("booking_cancelled")` in DELETE |
| **Modify** | `src/components/admin/settings-form.tsx` | Add "Notifications patients" section with 2 channel toggles |
| **Migrate** | Supabase `admin_settings` | Add 2 boolean columns |

---

## Step 1: DB Migration

```sql
ALTER TABLE admin_settings
  ADD COLUMN IF NOT EXISTS patient_notify_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS patient_notify_whatsapp boolean NOT NULL DEFAULT false;
```

---

## Step 2: Settings Module — `src/lib/settings.ts`

Add to `AdminSettings` interface (in the Notifications section):
```typescript
patient_notify_email: boolean;
patient_notify_whatsapp: boolean;
```

Add to `DEFAULT_SETTINGS`:
```typescript
patient_notify_email: true,
patient_notify_whatsapp: false,
```

---

## Step 3: Settings API — `src/app/api/admin/settings/route.ts`

Add to Zod schema:
```typescript
patient_notify_email: z.boolean().optional(),
patient_notify_whatsapp: z.boolean().optional(),
```

---

## Step 4: Message Templates — `src/lib/notifications/messages.ts`

Exports 3 functions:
- `buildEmailSubject(event)` → French subject line
- `buildEmailHtml(ctx)` → Full HTML email matching existing Edem-Care template style (blue `#0B4DA2` header, DM Sans font, details box)
- `buildPlainTextMessage(ctx)` → Concise French text for WhatsApp

Templates for each event:

| Event | Email Subject | WhatsApp Text |
|-------|--------------|---------------|
| `booking_created` | "Demande de rendez-vous reçue — Edem-Care" | Summary with date, time, care type. "Nous confirmerons sous peu." |
| `booking_confirmed` | "Votre rendez-vous est confirmé — Edem-Care" | Date, time, optional notes. "En cas d'empêchement, prévenez-nous." |
| `booking_cancelled` | "Rendez-vous annulé — Edem-Care" | Date, time, optional reason. "N'hésitez pas à reprendre RDV." |
| `booking_modified` | "Modification de votre rendez-vous — Edem-Care" | Old → new date/time. "Contactez-nous si besoin." |

Reuses:
- `escapeHtml` from `src/lib/utils.ts`
- `CARE_TYPE_LABELS` from `src/types/database.ts`
- `format` from `date-fns` with `fr` locale for date formatting

---

## Step 5: Unified Dispatcher — `src/lib/notifications/patient-notifications.ts`

```
notifyPatient(ctx: NotificationContext)
  ├── if settings.patient_notify_email → sendPatientEmail(ctx)
  └── if settings.patient_notify_whatsapp → sendPatientWhatsApp(ctx)
```

Key design:
- Uses `Promise.allSettled` — one channel failing doesn't block the other
- Email: dynamic `import("resend")`, sends via `resend.emails.send()` (existing pattern)
- WhatsApp: uses existing `sendWhatsAppMessage({ to, text })` from `src/lib/whatsapp/client.ts`
- Phone normalization: helper `normalizePhone()` strips spaces/dashes, ensures `+32` prefix for Belgian numbers
- Reads settings once via `getSettings()` (30s cached)
- All errors logged with `console.error`, never thrown to caller

Types:
```typescript
type PatientNotificationEvent = "booking_created" | "booking_confirmed" | "booking_cancelled" | "booking_modified";

interface NotificationContext {
  event: PatientNotificationEvent;
  booking: Booking;
  adminNotes?: string | null;
  previousDate?: string;        // for "modified"
  previousTimeStart?: string;   // for "modified"
  previousTimeEnd?: string;     // for "modified"
}
```

---

## Step 6: Wire into Booking Lifecycle

### 6a. New Booking — `src/app/api/booking/route.ts`

After the successful insert (line 111) and after the admin email block (line 187), add:
```typescript
try {
  const { notifyPatient } = await import("@/lib/notifications/patient-notifications");
  await notifyPatient({ event: "booking_created", booking });
} catch (e) {
  console.error("Patient notification error:", e);
}
```

### 6b. Admin Confirms/Cancels — `src/app/api/booking/status/route.ts`

Replace the entire inline email block (lines 59–130) with:
```typescript
try {
  const { notifyPatient } = await import("@/lib/notifications/patient-notifications");
  await notifyPatient({
    event: status === "confirmed" ? "booking_confirmed" : "booking_cancelled",
    booking,
    adminNotes: notes,
  });
} catch (e) {
  console.error("Patient notification error:", e);
}
```

### 6c. Patient Modifies — `src/app/api/patient/bookings/route.ts` PATCH

After successful update (line 161), before the return, add notification if date/time changed:
```typescript
if (wantsSlotUpdate && updated) {
  try {
    const { notifyPatient } = await import("@/lib/notifications/patient-notifications");
    await notifyPatient({
      event: "booking_modified",
      booking: updated as Booking,
      previousDate: booking.date,
      previousTimeStart: booking.time_slot_start,
      previousTimeEnd: booking.time_slot_end,
    });
  } catch (e) {
    console.error("Patient notification error:", e);
  }
}
```

Need to expand the initial booking SELECT (line 81) to include `patient_name`, `patient_phone`, `care_type` so the `previous` context has all fields for templates.

### 6d. Patient Cancels — `src/app/api/patient/bookings/route.ts` DELETE

After successful cancel (line 211), fetch full booking and notify:
```typescript
try {
  const { notifyPatient } = await import("@/lib/notifications/patient-notifications");
  const { data: fullBooking } = await supabase
    .from("bookings").select("*").eq("id", booking_id).single();
  if (fullBooking) {
    await notifyPatient({ event: "booking_cancelled", booking: fullBooking as Booking });
  }
} catch (e) {
  console.error("Patient notification error:", e);
}
```

---

## Step 7: Settings UI — `src/components/admin/settings-form.tsx`

In the Notifications tab, add a new section after the admin notification toggles:

**"Notifications patients"** section with:
- `patient_notify_email` Switch — "Envoyer un email au patient pour chaque changement de statut"
- `patient_notify_whatsapp` Switch — "Envoyer un message WhatsApp au patient (nécessite WhatsApp Business)"

Update the save handler to include both new fields.

---

## Implementation Order

```
1. DB migration (Supabase MCP)
2. src/lib/settings.ts (add 2 fields)
3. src/app/api/admin/settings/route.ts (add 2 Zod fields)
4. src/lib/notifications/messages.ts (templates)
5. src/lib/notifications/patient-notifications.ts (dispatcher)
6. src/app/api/booking/route.ts (wire booking_created)
7. src/app/api/booking/status/route.ts (replace inline email)
8. src/app/api/patient/bookings/route.ts (wire modified + cancelled)
9. src/components/admin/settings-form.tsx (UI toggles)
10. Build verification
```

---

## Verification

1. `npx next build` — 0 errors
2. Settings > Notifications shows "Notifications patients" section with 2 toggles
3. Toggling channels persists to DB
4. New booking → patient receives email confirmation of receipt
5. Admin confirms → patient receives confirmation email (and WhatsApp if enabled)
6. Admin cancels → patient receives cancellation email
7. Patient modifies date/time → patient receives modification email
8. Patient self-cancels → patient receives cancellation email
9. WhatsApp channel toggle off → no WhatsApp messages sent
10. One channel failing → other channel still sends (Promise.allSettled)
