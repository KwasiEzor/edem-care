# Edem-Care: Senior Developer Recommendations

This document outlines the high-priority technical recommendations to move the **Edem-Care** platform from a development prototype to a production-ready, secure, and scalable healthcare application.

---

## 1. 🛡️ Security: Role-Based Access Control (RBAC)
**Priority: CRITICAL**

*   **Problem:** Currently, RLS policies use `auth.role() = 'authenticated'`. If patient accounts are added, patients could technically query admin tables (conversations, notifications) via the Supabase client.
*   **Recommendation:** Implement Custom Claims (RBAC). Add an `is_admin` flag to the JWT.
*   **Action Plan:**
    *   Create a `profiles` table linked to `auth.users`.
    *   Add a Postgres trigger to sync metadata.
    *   Update all Admin RLS policies to check for `(auth.jwt() ->> 'is_admin')::boolean = true`.

## 2. 🤖 Anti-Spam: Bot Protection (Turnstile/reCAPTCHA)
**Priority: HIGH**

*   **Problem:** Public booking and contact forms are vulnerable to bot-spam, which could exhaust Resend/WhatsApp quotas and pollute the database.
*   **Recommendation:** Integrate **Cloudflare Turnstile** (invisible and user-friendly).
*   **Action Plan:**
    *   Add the Turnstile widget to `BookingWizard` and `ContactForm`.
    *   Validate the `cf-turnstile-response` token in the `/api/booking` and `/api/contact` routes.

## 3. 📧 DX & UX: Professional Email System (React Email)
**Priority: MEDIUM**

*   **Problem:** Admin and patient notifications use hardcoded HTML strings in API routes. These are hard to maintain and often break on mobile email clients.
*   **Recommendation:** Migrate to **@react-email**.
*   **Action Plan:**
    *   Create a `src/emails` directory.
    *   Develop branded components for: `NewBookingAdmin`, `BookingConfirmedPatient`, `BookingCancelledPatient`.
    *   Use the `.render()` method from React Email to generate consistent, responsive HTML.

## 4. 📱 UX: Mobile-First Admin Handoff
**Priority: HIGH**

*   **Problem:** Nurses use the dashboard on smartphones while in the field. Desktop-first tables are difficult to navigate on small screens.
*   **Recommendation:** Implement a responsive card-stack layout for mobile.
*   **Action Plan:**
    *   Update `BookingTable` and `WhatsAppInbox` to hide the `Table` on mobile (`hidden md:table`).
    *   Create a `Card` list for mobile view.
    *   Add "Actionable" links: `tel:` for phone numbers and `https://maps.apple.com/?q=` for addresses.

## 5. 🏥 Compliance: Sensitive Data Audit Log
**Priority: MEDIUM**

*   **Problem:** Healthcare standards (GDPR) require tracking who accesses sensitive patient data.
*   **Recommendation:** Implement a basic Audit Log table.
*   **Action Plan:**
    *   Create an `audit_logs` table: `id`, `admin_id`, `action`, `entity_id`, `timestamp`.
    *   Record events like `VIEW_PATIENT`, `CONFIRM_BOOKING`, `DELETE_RECORD`.

## 6. 🚀 Performance: Connection Pooling & Edge
**Priority: LOW/MEDIUM**

*   **Problem:** Serverless cold starts and database connection limits can slow down the WhatsApp webhook and Chatbot.
*   **Recommendation:** Use Supabase Connection Pooling (PgBouncer) and Vercel Edge Functions where possible.
*   **Action Plan:**
    *   Switch to port `6543` for the Admin Supabase client.
    *   Evaluate if the AI chat route can run on the `edge` runtime.
