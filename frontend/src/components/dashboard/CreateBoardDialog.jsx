import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';

const CreateBoardDialog = ({
  open,
  onOpenChange,
  onCreateBoard,
  isCreating,
}) => {
  const [boardBody, setBoardBody] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setBoardBody({ title: '', description: '' });
      setError('');
    }
  }, [open]);

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
      await onCreateBoard(boardBody).unwrap();
      onOpenChange(false);
      setBoardBody({ title: '', description: '' });
    } catch (err) {
      setError(
        err?.data?.message || 'Failed to create board. Please try again.',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a new board</DialogTitle>
          <DialogDescription>
            Create a workspace for your project and start collaboration.
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
              onChange={(e) =>
                setBoardBody({ ...boardBody, title: e.target.value })
              }
              value={boardBody.title}
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
              value={boardBody.description}
              onChange={(e) =>
                setBoardBody({ ...boardBody, description: e.target.value })
              }
              required
              rows={4}
              className="resize-none"
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
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating ||
                boardBody.title === '' ||
                boardBody.description === ''
              }
            >
              {isCreating ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plus className="mr-2 size-4" />
              )}
              {isCreating ? 'Creating...' : 'Create board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
