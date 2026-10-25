import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

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

const AddListDialog = ({ open, onOpenChange, onAddList }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('List title is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAddList(trimmedTitle);
      onOpenChange(false);
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Could not create list.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus className="size-4" />
              </span>
              Add a new list
            </DialogTitle>
            <DialogDescription>
              Create a list to organize cards on this board.
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            <label
              htmlFor="new-list-title"
              className="mb-2 block text-sm font-medium"
            >
              List name
            </label>
            <Input
              id="new-list-title"
              placeholder="e.g. In Progress"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError('');
              }}
              maxLength={100}
              autoFocus
              disabled={isSubmitting}
            />

            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Creating...' : 'Create list'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListDialog;
