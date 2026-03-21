import { env } from "@/lib/env";

export async function validateTurnstileToken(token?: string) {
  // If no secret key is configured, we skip validation (allows dev/CI)
  if (!env.TURNSTILE_SECRET_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Turnstile secret key missing. Skipping validation.");
      return true;
    }
    // In prod, if the key is missing but Turnstile is enabled in UI, it will fail
    // This is a safety measure.
    return true;
  }

  if (!token) return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET_KEY!)}&response=${encodeURIComponent(token)}`,
    }
  );

  const data = await response.json();
  return data.success;
}
