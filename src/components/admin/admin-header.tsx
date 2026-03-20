"use client";

import { NotificationBell } from "@/components/admin/notification-bell";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <div className="mb-8">
      <AdminBreadcrumbs />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-custom">{description}</p>
          )}
        </div>
        <NotificationBell />
      </header>
    </div>
  );
}
