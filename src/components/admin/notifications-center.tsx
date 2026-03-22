"use client";

import { useState } from "react";
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
import { EmptyState } from "@/components/ui/empty-state";
import {
  CalendarDays,
  MessageSquare,
  CheckCheck,
  Bell,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNotifications } from "@/hooks/use-notifications";
import Link from "next/link";

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: typeof Bell; color: string; link?: (data: Record<string, unknown> | null) => string }
> = {
  new_booking: {
    label: "Nouveau RDV",
    icon: CalendarDays,
    color: "text-forest",
    link: (data) => data?.booking_id ? `/admin/rendez-vous` : "/admin/rendez-vous",
  },
  new_contact: {
    label: "Nouveau message",
    icon: MessageSquare,
    color: "text-secondary",
    link: () => "/admin/contacts",
  },
  booking_confirmed: {
    label: "RDV confirmé",
    icon: CheckCheck,
    color: "text-forest",
    link: () => "/admin/rendez-vous",
  },
  booking_cancelled: {
    label: "RDV annulé",
    icon: Bell,
    color: "text-destructive",
    link: () => "/admin/rendez-vous",
  },
};

interface NotificationsCenterProps {
  initialNotifications: Notification[];
}

export function NotificationsCenter({
  initialNotifications,
}: NotificationsCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllRead, 
    deleteNotification 
  } = useNotifications(initialNotifications);
  
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications.filter((n) => n.type === filter);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(v) => { if (v) setFilter(String(v)); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
              <SelectItem value="new_booking">Rendez-vous</SelectItem>
              <SelectItem value="new_contact">Messages</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-forest/10 text-forest border-forest/20">
              {unreadCount} non lue(s)
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-0">
              <EmptyState
                icon={Bell}
                title="Aucune notification"
                description={
                  filter === "unread" 
                    ? "Vous avez lu toutes vos notifications. Bien joué !" 
                    : "Les nouvelles notifications apparaîtront ici en temps réel."
                }
                className="py-16"
              />
            </CardContent>
          </Card>
        ) : (
          filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;
            const link = config.link?.(notif.data as Record<string, unknown>);

            return (
              <Card
                key={notif.id}
                className={`group transition-all duration-200 hover:shadow-md ${
                  !notif.is_read ? "border-forest/30 bg-forest/[0.02]" : "bg-white"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${config.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!notif.is_read && (
                            <span className="w-2.5 h-2.5 bg-forest rounded-full shrink-0 animate-pulse" />
                          )}
                          <h3 className={`text-base font-semibold truncate ${!notif.is_read ? "text-ink" : "text-muted-custom"}`}>
                            {notif.title}
                          </h3>
                        </div>
                        <Badge variant="outline" className="hidden sm:inline-flex shrink-0 text-[10px] uppercase tracking-wider font-bold py-0.5">
                          {config.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-custom mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                        <span className="text-xs text-muted-custom/60 flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                        
                        <div className="flex items-center gap-2 ml-auto">
                          {link && (
                            <Link href={link}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs font-medium text-forest hover:text-forest hover:bg-forest/5"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                Voir les détails
                              </Button>
                            </Link>
                          )}
                          
                          {!notif.is_read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs font-medium"
                              onClick={() => markAsRead(notif.id)}
                            >
                              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                              Marquer lu
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-medium text-muted-custom hover:text-destructive hover:bg-destructive/5 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteNotification(notif.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
