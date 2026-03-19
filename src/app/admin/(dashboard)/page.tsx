import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  MessageSquare,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

async function getDashboardData() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().split("T")[0];

  const [
    { count: totalBookings },
    { count: pendingBookings },
    { count: todayBookings },
    { count: unreadContacts },
    { count: totalPatients },
    { data: recentActivity },
    { data: chartBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("date", today),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("bookings")
      .select("date, care_type, status, created_at")
      .gte("created_at", cutoff),
  ]);

  return {
    totalBookings: totalBookings || 0,
    pendingBookings: pendingBookings || 0,
    todayBookings: todayBookings || 0,
    unreadContacts: unreadContacts || 0,
    totalPatients: totalPatients || 0,
    recentActivity: recentActivity || [],
    chartBookings: chartBookings || [],
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const kpis = [
    {
      label: "RDV aujourd'hui",
      value: data.todayBookings,
      icon: CalendarDays,
      color: "text-forest",
      bgColor: "bg-forest/10",
      href: "/admin/rendez-vous",
    },
    {
      label: "En attente",
      value: data.pendingBookings,
      icon: Clock,
      color: "text-gold",
      bgColor: "bg-gold/10",
      href: "/admin/rendez-vous",
    },
    {
      label: "Messages non lus",
      value: data.unreadContacts,
      icon: MessageSquare,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/admin/contacts",
    },
    {
      label: "Patients",
      value: data.totalPatients,
      icon: Users,
      color: "text-ink",
      bgColor: "bg-ink/10",
      href: "/admin/patients",
    },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Vue d'ensemble de votre activité"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-custom">{kpi.label}</p>
                    <p className="mt-1 text-3xl font-bold text-ink">
                      {kpi.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center`}
                  >
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Booking Charts */}
      <div className="mb-8">
        <DashboardCharts bookings={data.chartBookings} />
      </div>

      {/* Visitor Analytics */}
      <div className="mb-8">
        <AnalyticsCharts />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-semibold text-ink mb-4">
            Activité récente
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-custom py-4">
              Aucune activité récente
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                      notif.is_read ? "bg-muted-foreground/30" : "bg-forest"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-custom truncate">
                      {notif.message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-custom/60 shrink-0">
                    {format(new Date(notif.created_at), "dd/MM HH:mm", {
                      locale: fr,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
