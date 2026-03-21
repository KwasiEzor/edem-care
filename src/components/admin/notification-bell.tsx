"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllRead,
    deleteNotification 
  } = useNotifications();

  // Show only last 5 in the dropdown
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" className="relative group overflow-visible">
            <Bell className="h-4 w-4 transition-transform group-hover:rotate-12" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1.5 flex items-center justify-center bg-destructive text-white text-[10px] font-bold border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
          <span className="text-sm font-bold text-ink">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                markAllRead();
              }}
              className="text-xs text-forest hover:text-forest/80 font-medium flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" />
              Tout marquer lu
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[350px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                <Bell className="h-5 w-5 text-muted-custom/40" />
              </div>
              <p className="text-sm text-muted-custom">Aucune notification</p>
            </div>
          ) : (
            recentNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`relative group flex flex-col items-start gap-1 p-4 cursor-pointer transition-colors hover:bg-muted/30 ${
                  !notif.is_read ? "bg-forest/[0.03]" : ""
                }`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-forest rounded-full shrink-0 mt-1.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-none mb-1 truncate ${!notif.is_read ? "text-ink" : "text-muted-custom"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-custom line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-custom/60 mt-2 block">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          render={<Link href="/admin/notifications" />}
          className="flex items-center justify-center py-3 text-sm text-forest font-bold hover:bg-forest/5 transition-colors"
        >
          Voir toutes les notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
