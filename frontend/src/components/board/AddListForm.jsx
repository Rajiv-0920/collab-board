import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InlineComposer from './InlineComposer';

// Same footprint as a BoardColumn so the form lines up with the lists.
const WIDTH = 'w-[min(86vw,20rem)] shrink-0 snap-start sm:w-80';

/**
 * "Add list" control at the end of the board.
 *
 * - isEmpty:  show a more prominent first-list prompt when the board has no lists.
 * - keepOpen: stay open after adding so several lists can be created in a row
 *             (the composer is remounted, so its input resets).
 */
const AddListForm = ({ onAddList, isEmpty = false, keepOpen = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [composerKey, setComposerKey] = useState(0);

  const containerRef = useRef(null);
  const submittingRef = useRef(false);

  // Bring the form into view when it opens (it sits at the far right of a
  // horizontally scrolling board).
  useEffect(() => {
    if (!isAdding) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    containerRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }, [isAdding]);

  const handleAdd = async (title) => {
    const value = typeof title === 'string' ? title.trim() : '';
    if (!value || submittingRef.current) return;

    submittingRef.current = true;
    try {
      // If this rejects, the form stays open and the composer shows the
      // failure (the parent also surfaces the error).
      await onAddList(value);

      if (keepOpen) setComposerKey((key) => key + 1);
      else setIsAdding(false);
    } finally {
      submittingRef.current = false;
    }
  };

  if (!isAdding) {
    return (
      <Button
        type="button"
        variant="outline"
        aria-expanded={false}
        className={cn(
          WIDTH,
          'group h-12 justify-start gap-2.5 rounded-2xl border-dashed border-border bg-transparent px-3.5',
          'text-muted-foreground transition-colors',
          'hover:border-primary/50 hover:bg-primary/5 hover:text-foreground',
          isEmpty &&
            'h-16 border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10',
        )}
        onClick={() => setIsAdding(true)}
      >
        <span
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-md bg-muted transition-colors',
            'group-hover:bg-primary/15 group-hover:text-primary',
            isEmpty && 'size-8 rounded-lg bg-primary/15 text-primary',
          )}
        >
          <Plus
            className={cn('size-4', isEmpty && 'size-5')}
            aria-hidden="true"
          />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-medium">
            {isEmpty ? 'Create your first list' : 'Add another list'}
          </span>
          {isEmpty && (
            <span className="text-xs font-normal text-muted-foreground">
              Lists group your cards, like To do or Done
            </span>
          )}
        </span>
      </Button>
    );
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Add a new list"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setIsAdding(false);
      }}
      className={cn(
        WIDTH,
        'animate-in fade-in-0 zoom-in-95 duration-150',
        'rounded-2xl border border-primary/30 bg-card p-2.5 shadow-sm ring-2 ring-primary/10',
      )}
    >
      <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
        New list
      </p>
      <InlineComposer
        key={composerKey}
        multiline={false}
        placeholder="Name this list…"
        submitLabel="Add list"
        onSubmit={handleAdd}
        onCancel={() => setIsAdding(false)}
      />
    </div>
  );
};

export default AddListForm;
