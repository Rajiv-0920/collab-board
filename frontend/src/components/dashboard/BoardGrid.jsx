import { cn } from '@/lib/utils';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './skeleton/BoardCardSkeleton';
import BoardsEmptyState from './BoardsEmptyState';

const GRID_CLASSES = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';
const SKELETON_COUNT = 6;

const BoardGrid = ({
  boards = [],
  isLoading = false,
  onEdit,
  onDelete,
  onCreate,
  canManageBoard = () => false,
  deletingBoardId,
}) => {
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

  if (boards.length === 0) {
    return <BoardsEmptyState onCreate={onCreate} />;
  }

  return (
    <div className={GRID_CLASSES}>
      {boards.map((board) => (
        <div
          key={board._id}
          className={cn(
            'transition-opacity',
            deletingBoardId === board._id && 'pointer-events-none opacity-50',
          )}
        >
          <BoardCard
            board={board}
            canManage={canManageBoard(board)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default BoardGrid;
