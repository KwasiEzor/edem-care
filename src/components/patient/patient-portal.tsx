"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CARE_TYPE_LABELS } from "@/types/database";
import { signInPatient, signOutPatient, signUpPatient, usePatientSession } from "@/lib/patient/session";
import { Clock, Loader2, Trash2 } from "lucide-react";

type Booking = {
  id: number;
  date: string;
  time_slot_start: string;
  time_slot_end: string;
  care_type: string;
  patient_notes: string | null;
  status: string;
  patient_name: string;
  patient_phone: string;
};

export function PatientPortal() {
  const session = usePatientSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState({
    date: "",
    time_slot_start: "",
    time_slot_end: "",
    care_type: "",
    patient_notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });

  const [signupState, setSignupState] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const isAuthenticated = Boolean(session?.user?.email);

  const patientEmail = session?.user?.email ?? "";

  const formattedName = useMemo(
    () => session?.user?.user_metadata?.full_name ?? session?.user?.email,
    [session]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setBookings([]);
      return;
    }

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
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    const { error } = await signInPatient(loginState);
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Connexion réussie !");
    setLoginState({ email: "", password: "" });
  };

  const handleSignup = async () => {
    setIsSubmitting(true);
    const { error } = await signUpPatient({
      email: signupState.email,
      password: signupState.password,
      name: signupState.name,
      phone: signupState.phone,
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Inscription enregistrée, confirmez votre email.");
    setSignupState({ name: "", email: "", password: "", phone: "" });
  };

  const handleSignOut = async () => {
    await signOutPatient();
  };

  const startEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setEditingValues({
      date: booking.date,
      time_slot_start: booking.time_slot_start,
      time_slot_end: booking.time_slot_end,
      care_type: booking.care_type,
      patient_notes: booking.patient_notes ?? "",
    });
  };

  const handleModify = async () => {
    if (!editingId) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        booking_id: editingId,
      };

      if (editingValues.date) {
        payload.date = editingValues.date;
      }

      if (editingValues.time_slot_start && editingValues.time_slot_end) {
        payload.time_slot_start = editingValues.time_slot_start;
        payload.time_slot_end = editingValues.time_slot_end;
      }

      if (editingValues.care_type) {
        payload.care_type = editingValues.care_type;
      }

      payload.patient_notes = editingValues.patient_notes;

      const res = await fetch("/api/patient/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Impossible de modifier");
      }

      toast.success("Demande mise à jour");
      setEditingId(null);
      setEditingValues({
        date: "",
        time_slot_start: "",
        time_slot_end: "",
        care_type: "",
        patient_notes: "",
      });
      const fresh = await fetch("/api/patient/bookings");
      const { bookings: refreshed } = await fresh.json();
      setBookings(refreshed ?? []);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    setCancelingId(bookingId);
    try {
      const res = await fetch("/api/patient/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Impossible d'annuler");
      }

      toast.success("Rendez-vous annulé");
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCancelingId(null);
    }
  };

  const isLoadingBookings = isFetching && isAuthenticated;

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-forest">
            Mon espace
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-ink">
            Gérez vos rendez-vous et votre profil
          </h1>
          <p className="mt-3 text-base text-muted-custom">
            Les patients peuvent consulter leurs rendez-vous, demander un
            report ou une annulation, et ajouter des notes à leur suivi.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-forest">
                  Connecté en tant que {formattedName}
                </p>
                <p className="text-sm text-muted-custom">Email : {patientEmail}</p>
                <Button
                  variant="outline"
                  className="rounded-full border-forest/40 text-forest"
                  onClick={handleSignOut}
                >
                  Se déconnecter
                </Button>
                <p className="text-sm text-muted-custom">
                  Accédez à vos rendez-vous ci-contre et utilisez les actions
                  pour modifier ou annuler votre demande.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">
                    Connexion
                  </p>
                  <div className="mt-4 space-y-4">
                    <Input
                      value={loginState.email}
                      onChange={(event) =>
                        setLoginState({ ...loginState, email: event.target.value })
                      }
                      type="email"
                      placeholder="Email"
                    />
                    <Input
                      value={loginState.password}
                      onChange={(event) =>
                        setLoginState({ ...loginState, password: event.target.value })
                      }
                      type="password"
                      placeholder="Mot de passe"
                    />
                    <Button
                      className="w-full rounded-full bg-forest text-white"
                      onClick={handleLogin}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">
                    Inscription
                  </p>
                  <div className="mt-4 space-y-4">
                    <Input
                      value={signupState.name}
                      onChange={(event) =>
                        setSignupState({ ...signupState, name: event.target.value })
                      }
                      placeholder="Votre nom"
                    />
                    <Input
                      value={signupState.email}
                      onChange={(event) =>
                        setSignupState({ ...signupState, email: event.target.value })
                      }
                      type="email"
                      placeholder="Email"
                    />
                    <Input
                      value={signupState.phone}
                      onChange={(event) =>
                        setSignupState({ ...signupState, phone: event.target.value })
                      }
                      placeholder="Téléphone"
                    />
                    <Input
                      value={signupState.password}
                      onChange={(event) =>
                        setSignupState({ ...signupState, password: event.target.value })
                      }
                      type="password"
                      placeholder="Mot de passe"
                    />
                    <Button
                      className="w-full rounded-full border border-forest text-forest"
                      variant="outline"
                      onClick={handleSignup}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Créer un compte"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-forest">
                  Rendez-vous
                </p>
                <p className="text-sm text-muted-custom">
                  {isAuthenticated
                    ? "Consultez vos prochaines visites ou demandez une mise à jour."
                    : "Connectez-vous pour voir vos rendez-vous."}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <Clock className="h-4 w-4 text-forest" />
                <span className="rounded-full bg-forest/20 px-3 py-1 text-forest">
                  {bookings.length} profils
                </span>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-muted-custom">
                Connectez-vous pour accéder à vos demandes et les gérer en toute
                autonomie.
              </div>
            ) : isLoadingBookings ? (
              <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-6 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-forest" />
                <p className="mt-3 text-sm text-muted-custom">Chargement en cours…</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-[1.6rem] border border-slate-200 bg-white/90 p-6 text-center text-sm text-muted-custom">
                Aucun rendez-vous pour le moment.
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-[1.6rem] border border-slate-200 bg-white/95 p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                      <div>
                        <p className="text-2xl font-semibold text-forest">
                          {format(new Date(booking.date), "EEEE d MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                        <p className="text-muted-custom">
                          Créneau : {booking.time_slot_start} - {booking.time_slot_end}
                        </p>
                      </div>
                      <div className="rounded-full bg-forest/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-forest">
                        {booking.status}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-custom">
                      Soins : {CARE_TYPE_LABELS[booking.care_type as keyof typeof CARE_TYPE_LABELS]}
                    </p>
                    <p className="text-sm text-muted-custom">
                      Infirmier : {booking.patient_name} · Tel {booking.patient_phone}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full border-slate-300 text-forest"
                        onClick={() => startEdit(booking)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full border border-transparent text-destructive"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelingId === booking.id}
                      >
                        {cancelingId === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Annuler
                          </>
                        )}
                      </Button>
                    </div>

                    {editingId === booking.id && (
                      <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            type="date"
                            value={editingValues.date}
                            onChange={(event) =>
                              setEditingValues({
                                ...editingValues,
                                date: event.target.value,
                              })
                            }
                          />
                          <div className="space-y-2">
                            <Input
                              type="time"
                              value={editingValues.time_slot_start}
                              onChange={(event) =>
                                setEditingValues({
                                  ...editingValues,
                                  time_slot_start: event.target.value,
                                })
                              }
                            />
                            <Input
                              type="time"
                              value={editingValues.time_slot_end}
                              onChange={(event) =>
                                setEditingValues({
                                  ...editingValues,
                                  time_slot_end: event.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <Select
                            value={editingValues.care_type || undefined}
                            onValueChange={(value) =>
                              setEditingValues({
                                ...editingValues,
                                care_type: value ?? "",
                              })
                            }
                          >
                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white px-4">
                              <SelectValue placeholder="Type de soins" />
                            </SelectTrigger>
                            <SelectContent className="mt-2">
                              {Object.entries(CARE_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={editingValues.patient_notes}
                            onChange={(event) =>
                              setEditingValues({
                                ...editingValues,
                                patient_notes: event.target.value,
                              })
                            }
                            placeholder="Notes ou besoins particuliers"
                          />
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button
                            className="rounded-full bg-forest text-white"
                            onClick={handleModify}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                            ) : (
                              "Sauvegarder"
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            className="rounded-full border border-slate-200 text-forest"
                            onClick={() => setEditingId(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
