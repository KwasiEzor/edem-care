"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification, NotificationType } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  MessageSquare,
  CheckCheck,
  Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: typeof Bell; color: string }
> = {
  new_booking: {
    label: "Nouveau RDV",
    icon: CalendarDays,
    color: "text-forest",
  },
  new_contact: {
    label: "Nouveau message",
    icon: MessageSquare,
    color: "text-secondary",
  },
  booking_confirmed: {
    label: "RDV confirmé",
    icon: CheckCheck,
    color: "text-forest",
  },
  booking_cancelled: {
    label: "RDV annulé",
    icon: Bell,
    color: "text-destructive",
  },
};

interface NotificationsCenterProps {
  initialNotifications: Notification[];
}

export function NotificationsCenter({
  initialNotifications,
}: NotificationsCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<string>("all");

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          toast.info(newNotif.title, {
            description: newNotif.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = async () => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(v) => v && setFilter(String(v))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
              <SelectItem value="new_booking">Rendez-vous</SelectItem>
              <SelectItem value="new_contact">Messages</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Badge variant="outline">{unreadCount} non lue(s)</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-custom/30 mx-auto mb-4" />
              <p className="text-muted-custom">Aucune notification</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;

            return (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                  !notif.is_read ? "border-forest/20 bg-forest/5" : ""
                }`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${config.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-forest rounded-full shrink-0" />
                      )}
                      <p className="text-sm font-medium text-ink">
                        {notif.title}
                      </p>
                    </div>
                    <p className="text-sm text-muted-custom mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-custom/60 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {config.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
