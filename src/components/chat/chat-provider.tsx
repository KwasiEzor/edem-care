"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./chat-widget";

export function ChatProvider() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith("/admin")) return null;

  return <ChatWidget />;
}
