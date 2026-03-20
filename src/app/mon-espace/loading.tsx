import { Skeleton } from "@/components/ui/skeleton";

export default function MonEspaceLoading() {
  return (
    <div className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center space-y-3">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-10 w-72 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
