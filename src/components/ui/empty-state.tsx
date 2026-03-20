import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-custom/50" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-custom">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          className="mt-4 rounded-full bg-forest text-white"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
