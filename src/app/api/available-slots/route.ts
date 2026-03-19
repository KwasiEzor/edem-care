import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Le paramètre date est requis" },
      { status: 400 }
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Format de date invalide (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("get_available_slots", {
    target_date: date,
  });

  if (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créneaux" },
      { status: 500 }
    );
  }

  return NextResponse.json({ slots: data || [] });
}
