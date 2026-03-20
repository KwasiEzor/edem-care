import { Skeleton } from "@/components/ui/skeleton";

export default function WhatsAppLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex gap-4 h-[600px]">
        <Skeleton className="w-[350px] rounded-xl" />
        <Skeleton className="flex-1 rounded-xl" />
      </div>
    </div>
  );
}
