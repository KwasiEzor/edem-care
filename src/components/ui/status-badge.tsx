import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: {
    label: "En attente",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmé",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Annulé",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  completed: {
    label: "Terminé",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
