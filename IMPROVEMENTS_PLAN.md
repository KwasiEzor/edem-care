# Improvement Plan

## AI & Data Enhancements
- Add an AI-powered triage/assistant widget to interpret French medical requests, suggest services, and prepare booking data for patients (future backend hook for LLMs).
- Replace static admin summaries with charts (appointments per day, care type breakdown, nurse availability). Include date filters and drill-down links.
- Introduce GDPR-compliant visitor tracking that logs page views/entry pages/referrers and surface those trends alongside charts.
- Add a "Care progress timeline" component on the homepage to visualize the patient journey (request → scheduling → visit → follow-up).
- Build an AI chatbot agent that can answer FAQs, collect appointment intents, and route visitors to booking/care flows; include server-side agent handler for validation, Supabase queries, and notifications.
- Log agent transcripts for auditing and reuse, and expose prompts/skills mapping so the assistant can evolve over time.

## Patient Experience
- Implement patient authentication (Supabase Auth or NextAuth) and a "Mon espace" section where users manage personal info, preferences, and documents.
- Extend `/api/booking` to support PATCH/DELETE so authenticated patients can modify or cancel appointments; send confirmation emails/SMS for each action.
- Create protected routes (`/mon-espace`, `/mes-rendez-vous`) that use session data to list upcoming/past bookings with Modify/Cancel buttons.
- Document workflow for patient account creation + first booking and for booking management (modified status, notifications, logging).
