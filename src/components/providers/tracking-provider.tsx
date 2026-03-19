"use client";

import { usePageTracking } from "@/hooks/use-page-tracking";

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}
