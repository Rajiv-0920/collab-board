import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';

import DashboardHeader from '../components/dashboard/DashboardHeader';

import {
  useCreateBoardMutation,
  useGetBoardsQuery,
  useUpdateBoardMutation,
} from '../services/boardsApi';
import { socket } from '../services/socket';
import { boardsApi } from '../services/boardsApi';
import {
  useGetInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} from '../services/inviteApi';
import { inviteApi } from '../services/inviteApi';
import DashboardStats from '@/components/dashboard/DashboardStats';
import BoardDialog from '@/components/dashboard/BoardDialog';
import { toast } from '@/components/ui/toast';
import BoardsErrorState from '../components/dashboard/BoardsErrorState';
import PendingInvitations from './PendingInvitations';

import { useCallback, useEffect, useMemo, useState } from 'react';
import BoardsSection, {
  DEFAULT_FILTERS,
} from '../components/dashboard/BoardsSection';

const BOARDS_PER_PAGE = 9;

const Dashboard = () => {
  const [boardDialog, setBoardDialog] = useState({ open: false, board: null });
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

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

  // One object = one RTK Query cache entry. It's also what we need later
  // to update the cache from socket events.
  const queryArgs = useMemo(
    () => ({ page, limit: BOARDS_PER_PAGE, ...filters }),
    [page, filters],
  );

  const {
    data,
    isLoading: isBoardsLoading,
    error: boardsError,
    isFetching: isBoardsFetching,
    isError: isBoardsError,
    refetch,
  } = useGetBoardsQuery(queryArgs);

  const boards = data?.boards ?? [];
  const pagination = data?.pagination;

  // A string like "id1,id2,id3". It only changes when the set of boards
  // changes, so effects below don't re-run for unrelated re-renders.
  const boardIdsKey = boards.map((board) => board._id).join(',');

  const [createBoard, { isLoading: isBoardCreating }] =
    useCreateBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
  const { data: invites, isLoading: isInvitesLoading } = useGetInvitesQuery();
  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();

  const openCreate = () => setBoardDialog({ open: true, board: null });
  const openEdit = (board) => setBoardDialog({ open: true, board });
  const onOpenChange = (open) => setBoardDialog((prev) => ({ ...prev, open }));

  useEffect(() => {
    const successMessage = sessionStorage.getItem('login_success');
    if (successMessage) {
      sessionStorage.removeItem('login_success');
      toast.add({ type: 'success', description: successMessage });
    }
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

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

    const handleBoardDeleted = () => {
      dispatch(boardsApi.util.invalidateTags(['Boards']));
    };

    const handleInvited = (payload) => {
      if (currentUser && payload.email === currentUser.email) {
        dispatch(inviteApi.util.invalidateTags(['Invites']));
      }
    };

    const handleInviteAccepted = (payload) => {
      if (currentUser && payload.inviteeId === currentUser._id) {
        dispatch(boardsApi.util.invalidateTags(['Boards']));
      }
    };

    const handleMemberDeleted = (userId) => {
      if (currentUser && userId === currentUser._id) {
        dispatch(boardsApi.util.invalidateTags(['Boards']));
      }
    };

    socket.on('board:updated', handleBoardUpdated);
    socket.on('board:deleted', handleBoardDeleted);
    socket.on('board:member:invited', handleInvited);
    socket.on('board:member:inviteAccepted', handleInviteAccepted);
    socket.on('board:member:deleted', handleMemberDeleted);

    return () => {
      socket.off('board:updated', handleBoardUpdated);
      socket.off('board:deleted', handleBoardDeleted);
      socket.off('board:member:invited', handleInvited);
      socket.off('board:member:inviteAccepted', handleInviteAccepted);
      socket.off('board:member:deleted', handleMemberDeleted);
    };
  }, [currentUser, dispatch, queryArgs]);

  const onAccept = async (inviteId) => {
    try {
      await acceptInvite(inviteId);
      refetch();
    } catch (err) {
      console.error('Accept invite failed:', err);
    }
  };

  const onDecline = async (inviteId) => {
    try {
      await declineInvite(inviteId);
    } catch (err) {
      console.error('Decline invite failed:', err);
    }
  };

  return (
    <div className="w-full">
      <DashboardHeader name={currentUser?.name} onCreateBoard={openCreate} />

      <BoardDialog
        boardDialog={boardDialog}
        onOpenChange={onOpenChange}
        onCreateBoard={createBoard}
        onUpdateBoard={updateBoard}
        isSaving={isBoardCreating || isUpdating}
      />

      <div className="mt-8 space-y-8">
        <DashboardStats />

        <PendingInvitations
          invites={invites}
          isLoading={isInvitesLoading}
          onAccept={onAccept}
          onDecline={onDecline}
        />

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

export default Dashboard;
