import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { toast } from '@/components/ui/toast';

import {
  boardsApi,
  useCreateBoardMutation,
  useGetBoardsQuery,
  useUpdateBoardMutation,
} from '../services/boardsApi';
import { socket } from '../services/socket';
import BoardDialog from '@/components/dashboard/BoardDialog';
import BoardsErrorState from '../components/dashboard/BoardsErrorState';
import BoardsSection, {
  DEFAULT_FILTERS,
} from '../components/dashboard/BoardsSection';

const BOARDS_PER_PAGE = 9;

const Boards = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [boardDialog, setBoardDialog] = useState({ open: false, board: null });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Any filter change sends the user back to page 1
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const queryArgs = useMemo(
    () => ({ page, limit: BOARDS_PER_PAGE, ...filters }),
    [page, filters],
  );

  const {
    data,
    isLoading: isBoardsLoading,
    isFetching: isBoardsFetching,
    isError: isBoardsError,
    error: boardsError,
    refetch,
  } = useGetBoardsQuery(queryArgs);

  const boards = data?.boards ?? [];
  const pagination = data?.pagination;
  const boardIdsKey = boards.map((board) => board._id).join(',');

  const [createBoard, { isLoading: isBoardCreating }] =
    useCreateBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();

  const openCreate = () => setBoardDialog({ open: true, board: null });
  const openEdit = (board) => setBoardDialog({ open: true, board });
  const onOpenChange = (open) => setBoardDialog((prev) => ({ ...prev, open }));

  // Socket connection
  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  // Join a room for every visible board so we get live updates
  useEffect(() => {
    if (!boardIdsKey) return undefined;
    const ids = boardIdsKey.split(',');

    ids.forEach((id) => {
      socket.emit('joinBoard', id, (response) => {
        if (!response?.success) console.log('Error', response?.message);
      });
    });

    return () => {
      ids.forEach((id) => socket.emit('leaveBoard', id));
    };
  }, [boardIdsKey]);

  // Live updates
  useEffect(() => {
    const handleBoardUpdated = (updatedBoard) => {
      dispatch(
        boardsApi.util.updateQueryData('getBoards', queryArgs, (draft) => {
          const boardToUpdate = draft?.boards?.find(
            (b) => b._id === updatedBoard._id,
          );
          if (!boardToUpdate) return;

          if (
            currentUser?._id?.toString() !==
            boardToUpdate.ownerId?._id?.toString()
          ) {
            toast.add({
              type: 'info',
              description: `“${boardToUpdate.title}” was updated by ${boardToUpdate.ownerId?.name}.`,
            });
          }

          boardToUpdate.title = updatedBoard.title;
          boardToUpdate.description = updatedBoard.description;
        }),
      );
    };

    const refreshBoards = () => {
      dispatch(boardsApi.util.invalidateTags(['Boards']));
    };

    const handleInviteAccepted = (payload) => {
      if (currentUser && payload.inviteeId === currentUser._id) refreshBoards();
    };

    const handleMemberDeleted = (userId) => {
      if (currentUser && userId === currentUser._id) refreshBoards();
    };

    socket.on('board:updated', handleBoardUpdated);
    socket.on('board:deleted', refreshBoards);
    socket.on('board:member:inviteAccepted', handleInviteAccepted);
    socket.on('board:member:deleted', handleMemberDeleted);

    return () => {
      socket.off('board:updated', handleBoardUpdated);
      socket.off('board:deleted', refreshBoards);
      socket.off('board:member:inviteAccepted', handleInviteAccepted);
      socket.off('board:member:deleted', handleMemberDeleted);
    };
  }, [currentUser, dispatch, queryArgs]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>
          <p className="text-sm text-muted-foreground">
            All the boards you own or collaborate on.
            {pagination?.total != null && ` (${pagination.total} total)`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 items-center rounded-4xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New board
        </button>
      </div>

      <BoardDialog
        boardDialog={boardDialog}
        onOpenChange={onOpenChange}
        onCreateBoard={createBoard}
        onUpdateBoard={updateBoard}
        isSaving={isBoardCreating || isUpdating}
      />

      <div className="mt-8">
        {isBoardsError ? (
          <BoardsErrorState
            error={boardsError}
            onRetry={refetch}
            isRetrying={isBoardsFetching}
          />
        ) : (
          <BoardsSection
            boards={boards}
            pagination={pagination}
            onPage={setPage}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isLoading={isBoardsLoading}
            isFetching={isBoardsFetching}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        )}
      </div>
    </div>
  );
};

export default Boards;
