"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CARE_TYPE_LABELS, type CareType } from "@/types/database";

interface BookingRow {
  date: string;
  care_type: string;
  status: string;
  created_at: string;
}

interface DashboardChartsProps {
  bookings: BookingRow[];
}

const CHART_COLORS = [
  "#0B4DA2",
  "#3B82F6",
  "#06B6D4",
  "#64748B",
  "#0F172A",
];

const RANGES = [
  { label: "7j", days: 7 },
  { label: "30j", days: 30 },
  { label: "90j", days: 90 },
] as const;

export function DashboardCharts({ bookings }: DashboardChartsProps) {
  const [range, setRange] = useState(30);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return bookings.filter((b) => new Date(b.created_at) >= cutoff);
  }, [bookings, range]);

  // Appointments per day
  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((b) => {
      const day = b.date;
      map.set(day, (map.get(day) || 0) + 1);
    });
    return Array.from(map, ([date, count]) => ({ date, count })).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }, [filtered]);

  // Care type breakdown
  const careTypeData = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((b) => {
      const label =
        CARE_TYPE_LABELS[b.care_type as CareType] || b.care_type;
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [filtered]);

  // Status distribution
  const statusData = useMemo(() => {
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Terminé",
    };
    const map = new Map<string, number>();
    filtered.forEach((b) => {
      const label = labels[b.status] || b.status;
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-ink">
          Statistiques des rendez-vous
        </h2>
        <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              variant={range === r.days ? "default" : "ghost"}
              size="sm"
              className={
                range === r.days
                  ? "bg-forest text-white hover:bg-forest/90"
                  : ""
              }
              onClick={() => setRange(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointments per day */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-custom">
            Rendez-vous par jour
          </h3>
          {dailyData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-custom">
              Aucune donnée pour cette période
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => {
                    const d = new Date(v + "T00:00:00");
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v) => {
                    const d = new Date(v + "T00:00:00");
                    return d.toLocaleDateString("fr-BE");
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Rendez-vous"
                  fill={CHART_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row: Pie + Status bar */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Care type donut */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-muted-custom">
              Types de soins
            </h3>
            {careTypeData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-custom">
                Aucune donnée
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={careTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {careTypeData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-muted-custom">
              Statuts
            </h3>
            {statusData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-custom">
                Aucune donnée
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    name="Rendez-vous"
                    fill={CHART_COLORS[1]}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
