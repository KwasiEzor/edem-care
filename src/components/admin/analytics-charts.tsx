"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
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

interface DailyStat {
  view_date: string;
  view_count: number;
  unique_sessions: number;
}

interface PageCount {
  page_path: string;
  count: number;
}

interface ReferrerCount {
  name: string;
  value: number;
}

export function AnalyticsCharts() {
  const [range, setRange] = useState(30);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topPages, setTopPages] = useState<PageCount[]>([]);
  const [referrers, setReferrers] = useState<ReferrerCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();

      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - range);
      const startStr = startDate.toISOString().split("T")[0];

      // Daily aggregates via RPC
      const { data: statsData } = await supabase.rpc("get_page_view_stats", {
        start_date: startStr,
        end_date: endDate,
      });

      // Top pages — raw query
      const { data: rawPages } = await supabase
        .from("page_views")
        .select("page_path")
        .gte("created_at", startDate.toISOString());

      // Top referrers
      const { data: rawReferrers } = await supabase
        .from("page_views")
        .select("referrer_origin")
        .gte("created_at", startDate.toISOString())
        .not("referrer_origin", "is", null);

      setDailyStats(statsData || []);

      // Aggregate top pages client-side
      if (rawPages) {
        const map = new Map<string, number>();
        rawPages.forEach((r: { page_path: string }) => {
          map.set(r.page_path, (map.get(r.page_path) || 0) + 1);
        });
        const sorted = Array.from(map, ([page_path, count]) => ({
          page_path,
          count,
        }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setTopPages(sorted);
      }

      // Aggregate referrers
      if (rawReferrers) {
        const map = new Map<string, number>();
        rawReferrers.forEach((r: { referrer_origin: string }) => {
          map.set(r.referrer_origin, (map.get(r.referrer_origin) || 0) + 1);
        });
        const sorted = Array.from(map, ([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
        setReferrers(sorted);
      }

      setLoading(false);
    };

    fetchData();
  }, [range]);

  // Chart data for area chart
  const areaData = useMemo(
    () =>
      dailyStats.map((d) => ({
        date: d.view_date,
        vues: d.view_count,
        visiteurs: d.unique_sessions,
      })),
    [dailyStats]
  );

  return (
    <div className="space-y-6">
      {/* Header + range */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-ink">
          Analytique visiteurs
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

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-custom">Chargement...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Page views over time */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-muted-custom">
                Pages vues par jour
              </h3>
              {areaData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-custom">
                  Aucune donnée pour cette période
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B4DA2" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0B4DA2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="vues"
                      name="Pages vues"
                      stroke="#0B4DA2"
                      fillOpacity={1}
                      fill="url(#colorVues)"
                    />
                    <Area
                      type="monotone"
                      dataKey="visiteurs"
                      name="Visiteurs uniques"
                      stroke="#06B6D4"
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top pages */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-muted-custom">
                  Pages les plus visitées
                </h3>
                {topPages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-custom">
                    Aucune donnée
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topPages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="page_path"
                        tick={{ fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Vues"
                        fill={CHART_COLORS[2]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Referrer sources */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-muted-custom">
                  Sources de trafic
                </h3>
                {referrers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-custom">
                    Aucune donnée
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={referrers}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {referrers.map((_, i) => (
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
          </div>
        </>
      )}
    </div>
  );
}
