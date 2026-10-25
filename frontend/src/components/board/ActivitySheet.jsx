import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { UserAvatar } from './BoardParts';
import { describeActivity, timeAgo } from './boardUtils';

/* Right-hand panel listing what happened on the board, newest first.
 *
 * Older entries load automatically when the bottom of the list scrolls into
 * view, and the "Load more" button stays as a fallback (keyboard users,
 * browsers without IntersectionObserver).
 */
const ActivitySheet = ({
  open,
  onOpenChange,
  activities = [],
  isLoading = false,
  isLoadingMore = false,
  hasNextPage = false,
  onLoadMore,
}) => {
  // State instead of refs: the sheet content mounts after `open` flips, so we
  // need to re-run the observer effect once the elements actually exist.
  const [scrollEl, setScrollEl] = useState(null);
  const [sentinelEl, setSentinelEl] = useState(null);

  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const busy = isLoading || isLoadingMore;
  const count = activities.length;

  useEffect(() => {
    if (!scrollEl || !sentinelEl || !hasNextPage || busy) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current?.();
        }
      },
      { root: scrollEl, rootMargin: '0px 0px 160px 0px' },
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
    // `count` is a dependency on purpose: after a page arrives the observer is
    // recreated, which re-fires if the sentinel is still visible (short list).
  }, [scrollEl, sentinelEl, hasNextPage, busy, count]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Activity</SheetTitle>
          <SheetDescription>Recent changes on this board.</SheetDescription>
        </SheetHeader>

        <div
          ref={setScrollEl}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {isLoading ? (
            <ul className="space-y-4" aria-busy="true" aria-label="Loading">
              {[0, 1, 2, 3].map((item) => (
                <li key={item} className="flex gap-3">
                  <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                  </div>
                </li>
              ))}
            </ul>
          ) : count === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing has happened on this board yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {activities.map((activity, index) => (
                <li
                  key={activity._id ?? `${activity.createdAt}-${index}`}
                  className="flex gap-3"
                >
                  <UserAvatar
                    user={activity.userId}
                    className="size-8 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="break-words text-sm leading-snug">
                      <span className="font-medium">
                        {activity.userId?.name}
                      </span>{' '}
                      <span className="text-muted-foreground">
                        {describeActivity(activity)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Invisible marker that triggers loading the next page */}
          {hasNextPage && !isLoading && (
            <div ref={setSentinelEl} className="h-px" aria-hidden="true" />
          )}

          {hasNextPage && !isLoading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              aria-busy={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                'Load more'
              )}
            </Button>
          )}

          {!hasNextPage && !isLoading && count > 0 && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              You&apos;re all caught up.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActivitySheet;
