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

import { Loader2, Trash2, TriangleAlert } from 'lucide-react';

const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  itemName,
  details,
  onConfirm,
  isDeleting = false,
}) => {
  const handleDelete = async (event) => {
    event.preventDefault();

    if (isDeleting || !onConfirm) return;

    await onConfirm();
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
          {/* Layered warning icon */}
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/5">
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20">
              <TriangleAlert className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-1.5">
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>

            <AlertDialogDescription className="leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {/* Item details */}
        {itemName && (
          <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3.5 text-center">
            <p className="truncate text-sm font-medium" title={itemName}>
              {itemName}
            </p>

            {details && (
              <div className="text-xs text-muted-foreground">{details}</div>
            )}
          </div>
        )}

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

export default DeleteConfirmDialog;
