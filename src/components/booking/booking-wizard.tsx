"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, Clock, FileText, User } from "lucide-react";
import { DateStep } from "./date-step";
import { TimeStep } from "./time-step";
import { DetailsStep } from "./details-step";
import { SuccessStep } from "./success-step";

const steps = [
  { id: 1, label: "Date", icon: Calendar },
  { id: 2, label: "Créneau", icon: Clock },
  { id: 3, label: "Details", icon: User },
];

export type BookingData = {
  date: string;
  time_slot_start: string;
  time_slot_end: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  care_type: string;
  patient_notes: string;
};

interface BookingWizardProps {
  maxDays?: number;
  allowSundays?: boolean;
}

export function BookingWizard({ maxDays = 60, allowSundays = false }: BookingWizardProps) {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>(() => {
    const careType = searchParams.get("care_type");
    return careType ? { care_type: careType } : {};
  });
  const [isComplete, setIsComplete] = useState(false);

  const updateData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  if (isComplete) {
    return <SuccessStep data={bookingData as BookingData} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Parcours
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold text-ink">
          Une reservation guidee en trois etapes.
        </h2>
        <div className="mt-8 space-y-4">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`rounded-[1.4rem] border p-4 transition-all ${
                  isCurrent
                    ? "border-forest/20 bg-[linear-gradient(135deg,rgba(11,77,162,0.08)_0%,rgba(6,182,212,0.08)_100%)]"
                    : isDone
                      ? "border-cyan-100 bg-cyan-50/70"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      isCurrent
                        ? "bg-forest text-white"
                        : isDone
                          ? "bg-cyan-600 text-white"
                          : "bg-white text-muted-custom"
                    }`}
                  >
                    {isDone ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-custom">
                      Etape {step.id}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">{step.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-[1.6rem] bg-[linear-gradient(180deg,#0b4da2_0%,#0f67cc_100%)] p-5 text-white">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-cyan-200" />
            <p className="font-semibold">Resume de la demande</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-blue-100/82">
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
              Date : {bookingData.date || "A selectionner"}
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
              Creneau : {bookingData.time_slot_start ? `${bookingData.time_slot_start.slice(0, 5)} - ${bookingData.time_slot_end?.slice(0, 5)}` : "A selectionner"}
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
              Soins : {bookingData.care_type || "A preciser"}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <DateStep
              selectedDate={bookingData.date}
              maxDays={maxDays}
              allowSundays={allowSundays}
              onSelect={(date) => {
                updateData({ date });
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 2 && (
            <TimeStep
              date={bookingData.date!}
              selectedSlot={bookingData.time_slot_start}
              onSelect={(start, end) => {
                updateData({ time_slot_start: start, time_slot_end: end });
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <DetailsStep
              data={bookingData}
              onSubmit={(details) => {
                updateData(details);
                setIsComplete(true);
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
