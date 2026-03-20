"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="font-heading text-xl font-bold text-ink">
        Erreur de chargement
      </h2>
      <p className="mt-2 text-sm text-muted-custom">
        Impossible de charger cette page. Veuillez réessayer.
      </p>
      <Button
        className="mt-6 rounded-full bg-forest text-white"
        onClick={reset}
      >
        Réessayer
      </Button>
    </div>
  );
}
