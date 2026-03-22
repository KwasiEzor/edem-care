"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/database";
import { toast } from "sonner";
import { getSettings } from "@/lib/settings";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function useNotifications(initialData: Notification[] = []) {
  const [notifications, setNotifications] = useState<Notification[]>(initialData);
  const [unreadCount, setUnreadCount] = useState(
    initialData.filter((n) => !n.is_read).length
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on first user interaction if possible, or just keep ref
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const playSound = useCallback(async () => {
    try {
      const settings = await getSettings();
      if (settings.notify_sound_alerts && audioRef.current) {
        audioRef.current.play().catch(e => console.warn("Audio play blocked:", e));
      }
    } catch (e) {
      console.error("Error playing notification sound:", e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, []);

  // Separate initial fetch to avoid setState in effect warnings
  useEffect(() => {
    if (initialData.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();
    }
  }, [fetchNotifications, initialData.length]);

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel("global-notifications")
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
          setUnreadCount((prev) => prev + 1);
          
          toast.info(newNotif.title, {
            description: newNotif.message,
          });
          
          playSound();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          setUnreadCount((prev) => {
            const old = notifications.find(n => n.id === updated.id);
            if (old?.is_read === false && updated.is_read === true) {
              return Math.max(0, prev - 1);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialData.length, playSound, notifications]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllRead = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("Toutes les notifications ont été marquées comme lues");
    }
  };

  const deleteNotification = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (!error) {
      const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
