import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 500;

const textareaClassName = [
  'flex min-h-24 w-full resize-none rounded-md border border-input',
  'bg-transparent px-3 py-2 text-sm shadow-xs outline-none',
  'placeholder:text-muted-foreground',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

/**
 * The form lives in its own component so its state is initialised from the
 * board each time the dialog opens (the dialog content unmounts when closed).
 * That also means a live socket update to the board can't overwrite what the
 * person is typing.
 */
const EditBoardForm = ({ board, onSubmit, onClose }) => {
  const titleId = useId();
  const descriptionId = useId();

  const [title, setTitle] = useState(board?.title ?? '');
  const [description, setDescription] = useState(board?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  const unchanged =
    trimmedTitle === (board?.title ?? '').trim() &&
    trimmedDescription === (board?.description ?? '').trim();

  const canSave = trimmedTitle.length > 0 && !unchanged && !isSaving;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    try {
      await onSubmit({ title: trimmedTitle, description: trimmedDescription });
      onClose();
    } catch {
      // The parent shows the error toast; keep the dialog open with the draft.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Edit board</DialogTitle>
        <DialogDescription>
          Change the board&apos;s name and description. Everyone on the board
          will see the update.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <label htmlFor={titleId} className="text-sm font-medium">
          Title
        </label>
        <Input
          id={titleId}
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Product roadmap"
          maxLength={TITLE_MAX}
          disabled={isSaving}
          aria-invalid={title.length > 0 && !trimmedTitle ? true : undefined}
        />
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={descriptionId} className="text-sm font-medium">
            Description{' '}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <span
            className="text-xs tabular-nums text-muted-foreground"
            aria-hidden="true"
          >
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this board for?"
          maxLength={DESCRIPTION_MAX}
          disabled={isSaving}
          rows={4}
          className={textareaClassName}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSave}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const EditBoardDialog = ({ open, onOpenChange, board, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
      <EditBoardForm
        board={board}
        onSubmit={onSubmit}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
);

export default EditBoardDialog;
