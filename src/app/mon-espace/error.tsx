"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function MonEspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-ink">
          Une erreur est survenue
        </h2>
        <p className="mt-2 text-sm text-muted-custom">
          Impossible de charger votre espace patient. Veuillez réessayer.
        </p>
        <Button
          className="mt-6 rounded-full bg-forest text-white"
          onClick={reset}
        >
          Réessayer
        </Button>
      </div>
    </div>
  );
}
