import { Skeleton } from '@/components/ui/skeleton';

const BoardCardSkeleton = () => (
  <div
    className="flex flex-col gap-4 rounded-xl border bg-card p-5"
    aria-hidden="true"
  >
    {/* Title */}
    <Skeleton className="h-5 w-2/5" />

    {/* Description (2 lines) */}
    <div className="-mt-2 min-h-10 space-y-2">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-3/4" />
    </div>

    {/* Meta */}
    <Skeleton className="h-3 w-24" />

    {/* Footer */}
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Skeleton className="size-6 rounded-full border-2 border-card" />
        <Skeleton className="-ml-1.5 size-6 rounded-full border-2 border-card" />
        <Skeleton className="-ml-1.5 size-6 rounded-full border-2 border-card" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export default BoardCardSkeleton;
