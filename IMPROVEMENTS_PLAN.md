# Edem-Care Improvement Plan

This plan outlines the architectural and security improvements for the Edem-Care platform, based on the senior developer review.

## 1. Security & Isolation (High Priority)
- [x] **Implement `server-only` Protection:**
    - Install `server-only` package.
    - Add `import "server-only"` to `src/lib/env.ts`, `src/lib/supabase/admin.ts`, and any AI/Email service files to prevent accidental client-side leakage of sensitive keys.
- [x] **Audit Environment Variables:** 
    - Verified that no sensitive keys (Service Role, API Secrets) are prefixed with `NEXT_PUBLIC_`.

## 2. Caching & Data Fetching (High Priority)
- [x] **Standardize Caching in `src/lib/settings.ts`:**
    - Replace the manual `let cache` variable and TTL logic.
    - Implement `unstable_cache` from `next/cache` for fetching business settings.
    - Define a clear revalidation tag (e.g., `'settings'`).
- [x] **Implement Cache Purging:**
    - Add `revalidateTag('settings')` in any admin action that updates business configuration to ensure immediate consistency.

## 3. Form Handling & Server Actions (Medium Priority)
- [x] **Migrate Booking Submission to Server Actions:**
    - Create a new server action for booking creation.
    - Integrate Turnstile and Math challenge validation directly within the action.
    - Replace the `fetch('/api/booking')` call in `DetailsStep` with the new action.
- [x] **Migrate Contact Form to Server Actions:**
    - Refactor `src/app/actions/contact.ts` (if it exists as a standard function) to a full Next.js Server Action.
    - Ensure proper error handling and toast notifications.

## 4. State Management & UX (Medium Priority)
- [x] **Refactor Booking Wizard State:**
    - Passed `turnstileSiteKey` as prop to avoid server-only environment leakage in Client Components.
    - Simplified state flow and ensured proper revalidation with `revalidatePath`.
- [x] **Improve Bot Protection UX:**
    - Implemented immediate math fallback when Turnstile is disabled or fails to load, removing the 6s delay.

## Verification Strategy
- [x] **Step-by-Step Testing:** Build successful (`npm run build`) with `server-only` and `taint` enabled.
- [x] **Functional Testing:** Form submissions migrated to Server Actions and type-checked.
- [x] **Cache Testing:** Native Next.js caching implemented with `unstable_cache` and manual purging via `revalidatePath`.
