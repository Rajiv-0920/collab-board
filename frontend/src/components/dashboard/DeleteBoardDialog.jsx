import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  CheckCircle2,
  Columns3,
  Loader2,
  Trash2,
  TriangleAlert,
  Users,
} from 'lucide-react';

const pluralize = (count, singular) =>
  `${count} ${count === 1 ? singular : `${singular}s`}`;

const Count = ({ icon: Icon, children }) => (
  <span className="flex items-center gap-1.5">
    <Icon className="size-3.5" aria-hidden="true" />
    <span className="tabular-nums">{children}</span>
  </span>
);

const DeleteBoardDialog = ({
  open,
  onOpenChange,
  board,
  onConfirm,
  isDeleting = false,
}) => {
  if (!board) return null;

  const { listCount = 0, taskCount = 0, memberCount = 0 } = board.summary ?? {};

  const handleDelete = async (event) => {
    // Keep the dialog open until the request finishes.
    event.preventDefault();

    if (isDeleting) return;

    await onConfirm(board);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isDeleting && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="gap-5 sm:max-w-sm">
        <AlertDialogHeader className="items-center gap-4 text-center sm:text-center">
          {/* Layered icon */}
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/5">
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-1.5">
            <AlertDialogTitle className="text-lg">
              Delete this board?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board and everything in it. You
              can&apos;t undo this.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {/* What is being deleted */}
        <div className="space-y-2.5 rounded-lg border bg-muted/40 p-3.5 text-center">
          <p className="truncate text-sm font-medium" title={board.title}>
            {board.title}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Count icon={Columns3}>{pluralize(listCount, 'list')}</Count>
            <Count icon={CheckCircle2}>{pluralize(taskCount, 'task')}</Count>
            <Count icon={Users}>{pluralize(memberCount, 'member')}</Count>
          </div>
        </div>

        <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <AlertDialogCancel disabled={isDeleting} className="mt-0">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(buttonVariants({ variant: 'destructive' }))}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBoardDialog;
