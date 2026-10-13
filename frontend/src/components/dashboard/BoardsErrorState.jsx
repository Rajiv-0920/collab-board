import { CloudOff, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* Works with RTK Query errors: { status, data: { message } } or a plain Error. */
const getErrorDetail = (error) => {
  if (!error) return null;
  if (error.status === 'FETCH_ERROR') return 'Network error';
  if (error.status === 'TIMEOUT_ERROR') return 'Request timed out';
  if (error.data?.message) return error.data.message;
  if (typeof error.status === 'number') return `Error ${error.status}`;
  return error.message ?? null;
};

const BoardsErrorState = ({
  error,
  onRetry,
  isRetrying = false,
  className,
}) => {
  const detail = getErrorDetail(error);

  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/[0.03] px-6 py-12 text-center',
        className,
      )}
    >
      {/* Layered icon */}
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/5">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
          <CloudOff className="size-5" aria-hidden="true" />
        </div>
      </div>

      <h3 className="text-base font-semibold tracking-tight">
        Couldn&apos;t load your boards
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
        Something went wrong while fetching your boards. Check your connection
        and try again.
      </p>

      {detail && (
        <p className="mt-3 rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
          {detail}
        </p>
      )}

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          disabled={isRetrying}
          onClick={() => onRetry()}
        >
          <RefreshCw
            className={cn('mr-2 size-4', isRetrying && 'animate-spin')}
            aria-hidden="true"
          />
          {isRetrying ? 'Retrying...' : 'Try again'}
        </Button>
      )}
    </div>
  );
};

export default BoardsErrorState;
