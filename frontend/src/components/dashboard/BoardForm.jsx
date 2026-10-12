import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Loader2 } from 'lucide-react';

const BoardForm = ({ board, isSaving, onSubmit, onCancel }) => {
  const isEdit = Boolean(board);
  const [boardBody, setBoardBody] = useState({
    title: board?.title ?? '',
    description: board?.description ?? '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!boardBody.title.trim()) {
      setError('Board title is required.');
      return;
    }
    if (!boardBody.description.trim()) {
      setError('Board description is required.');
      return;
    }

    setError('');
    try {
      await onSubmit({
        title: boardBody.title.trim(),
        description: boardBody.description.trim(),
      });
    } catch (err) {
      setError(
        err?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'create'} board. Please try again.`,
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">
          {isEdit ? 'Edit board' : 'Create a new board'}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the title and description of this board.'
            : 'Create a workspace for your project and start collaboration.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="board-title" className="text-sm font-medium">
            Board title
          </Label>
          <Input
            id="board-title"
            placeholder="e.g. Website redesign"
            maxLength={100}
            autoFocus
            required
            value={boardBody.title}
            onChange={(e) =>
              setBoardBody((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="board-description" className="text-sm font-medium">
            Board description
          </Label>
          <Textarea
            id="board-description"
            placeholder="What is this board about?"
            maxLength={500}
            required
            rows={4}
            className="resize-none"
            value={boardBody.description}
            onChange={(e) =>
              setBoardBody((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSaving ||
              !boardBody.title.trim() ||
              !boardBody.description.trim()
            }
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : isEdit ? (
              <Save className="mr-2 size-4" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            {isSaving
              ? isEdit
                ? 'Saving...'
                : 'Creating...'
              : isEdit
                ? 'Save changes'
                : 'Create board'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default BoardForm;
