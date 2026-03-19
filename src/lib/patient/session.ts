"use client";

import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

type AuthCredentials = {
  email: string;
  password: string;
};

type SignUpPayload = AuthCredentials & {
  name: string;
  phone?: string;
};

export function usePatientSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return session;
}

export async function signInPatient({ email, password }: AuthCredentials) {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { error, session: data.session ?? null };
}

export async function signUpPatient({
  email,
  password,
  name,
  phone,
}: SignUpPayload) {
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone,
      },
    },
  });

  return { error, session: data.session ?? null };
}

export async function signOutPatient() {
  await supabase.auth.signOut();
}

export function getPatientUser(session: Session | null): User | null {
  return session?.user ?? null;
}
