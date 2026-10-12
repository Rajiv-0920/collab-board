import { Dialog, DialogContent } from '@/components/ui/dialog';
import BoardForm from './BoardForm';
import { toast } from '@/components/ui/toast';

const BoardDialog = ({
  boardDialog: { board, open },
  onOpenChange,
  onCreateBoard,
  onUpdateBoard,
  isSaving = false,
}) => {
  const handleSubmit = async (values) => {
    if (board) {
      await onUpdateBoard({ id: board._id, body: values }).unwrap();
      toast.add({
        type: 'success',
        description: 'Board updated successfully!',
      });
    } else {
      await onCreateBoard(values).unwrap();
      toast.add({ type: 'success', description: 'Your new board is ready!' });
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isSaving && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-120">
        <BoardForm
          key={board?._id ?? 'new'}
          board={board}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BoardDialog;
