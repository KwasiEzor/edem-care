"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, CalendarDays, User, LogOut } from "lucide-react";
import { signOutPatient } from "@/lib/patient/session";
import { toast } from "sonner";
import { BookingsTab, type Booking } from "./bookings-tab";
import { ProfileTab } from "./profile-tab";
import { PageTransition } from "@/components/ui/page-transition";

interface PatientDashboardProps {
  session: Session;
}

export function PatientDashboard({ session }: PatientDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const formattedName =
    session.user.user_metadata?.full_name ?? session.user.email;

  useEffect(() => {
    const fetchBookings = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("/api/patient/bookings");
        if (!res.ok) {
          const payload = await res.json();
          throw new Error(payload.error || "Échec de récupération");
        }
        const json = await res.json();
        setBookings(json.bookings ?? []);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBookings();
  }, []);

  const handleSignOut = async () => {
    await signOutPatient();
  };

  return (
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">
            Bonjour, {formattedName}
          </h2>
          <p className="text-sm text-muted-custom">{session.user.email}</p>
        </div>
        <Button
          variant="outline"
          className="rounded-full border-forest/40 text-forest"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Mes rendez-vous
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-1.5" />
            Mon profil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {isFetching ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-forest" />
              <p className="mt-3 text-sm text-muted-custom">
                Chargement de vos rendez-vous...
              </p>
            </div>
          ) : (
            <BookingsTab
              bookings={bookings}
              onBookingsChange={setBookings}
            />
          )}
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab session={session} />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
