"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/database";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-gold",
  confirmed: "bg-forest",
  cancelled: "bg-destructive",
  completed: "bg-muted-foreground",
};

interface CalendarViewProps {
  bookings: Booking[];
}

export function CalendarView({ bookings }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getBookingsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookings.filter((b) => b.date === dateStr);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-heading text-xl font-semibold text-ink capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Calendar cells */}
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`bg-white min-h-24 p-1.5 ${
                  !inMonth ? "opacity-40" : ""
                } ${today ? "ring-2 ring-forest ring-inset" : ""}`}
              >
                <span
                  className={`text-xs font-medium ${
                    today ? "text-forest" : "text-ink"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-1 text-xs truncate"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          STATUS_COLORS[booking.status]
                        }`}
                      />
                      <span className="truncate text-ink/80">
                        {booking.time_slot_start.slice(0, 5)}{" "}
                        {booking.patient_name.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <span className="text-xs text-muted-custom">
                      +{dayBookings.length - 3} autres
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-muted-custom">En attente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span className="text-muted-custom">Confirmé</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
