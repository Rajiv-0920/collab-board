import { Skeleton } from '@/components/ui/skeleton';
const RowSkeletons = () => (
  <div
    className="divide-y overflow-hidden rounded-xl border bg-card"
    role="status"
    aria-busy="true"
    aria-label="Loading boards"
  >
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 px-4 py-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3.5 w-2/5" />
        </div>
        <Skeleton className="hidden h-3 w-24 md:block" />
        <Skeleton className="hidden size-6 rounded-full sm:block" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    ))}
  </div>
);

export default RowSkeletons;
