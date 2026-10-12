import { LayoutGrid, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './skeleton/BoardCardSkeleton';

import { useGetBoardsQuery } from '../../services/boardsApi';
import { selectCurrentUser } from '../../store/authSlice';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useDeleteBoardMutation } from '../../services/boardsApi';
import DeleteBoardDialog from './DeleteBoardDialog';
import { toast } from '@/components/ui/toast';

const GRID_CLASSES = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';
const SKELETON_COUNT = 6;

const BoardGrid = ({ boards, isLoading, onEdit, onCreate }) => {
  const [boardToDelete, setBoardToDelete] = useState(null);
  const currentUser = useSelector(selectCurrentUser);
  const [deleteBoard, { isLoading: isBoardDeleting }] =
    useDeleteBoardMutation();

  const handleDeleteBoard = (board) => {
    setBoardToDelete(board);
  };

  const onOpenChange = (open) => {
    if (!open && !isBoardDeleting) {
      setBoardToDelete(null);
    }
  };

  const confirmDeleteBoard = async (board) => {
    try {
      await deleteBoard(board._id).unwrap();
      toast.add({
        type: 'success',
        description: 'Board deleted successfully!',
      });
      setBoardToDelete(null);
    } catch (error) {
      toast.error(
        error?.data?.message || 'Failed to delete board. Please try again.',
      );
    }
  };

  if (isLoading) {
    return (
      <div
        className={GRID_CLASSES}
        role="status"
        aria-busy="true"
        aria-label="Loading boards"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <BoardCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  /* Should be replace with Empty Board state, so you need to create a new empty state */
  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted">
          <LayoutGrid className="size-5 text-muted-foreground" />
        </div>

        <h3 className="text-sm font-medium">No boards yet</h3>

        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Create your first board to organize tasks and collaborate with your
          team.
        </p>

        <Button size="sm" className="mt-5" onClick={onCreate}>
          <Plus className="mr-1.5 size-4" />
          New board
        </Button>
      </div>
    );
  }

  return (
    <div className={GRID_CLASSES}>
      <DeleteBoardDialog
        open={Boolean(boardToDelete)}
        onOpenChange={onOpenChange}
        board={boardToDelete}
        onConfirm={confirmDeleteBoard}
        isDeleting={isBoardDeleting}
      />
      {boards.map((board) => (
        <div
          key={board._id}
          className={cn(
            'transition-opacity',
            isBoardDeleting && 'pointer-events-none opacity-50',
          )}
        >
          <BoardCard
            board={board}
            canManage={
              Boolean(currentUser) &&
              board.ownerId._id.toString() === currentUser._id.toString()
            }
            onEdit={onEdit}
            onDeleteBoard={handleDeleteBoard}
          />
        </div>
      ))}
    </div>
  );
};

export default BoardGrid;
