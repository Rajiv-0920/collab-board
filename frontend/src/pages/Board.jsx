import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from '@/components/ui/toast';

import {
  useGetBoardDetailsQuery,
  useGetBoardActivityQuery,
} from '../services/boardsApi';

import { selectCurrentUser } from '../store/authSlice';

import BoardSkeleton from '@/components/board/BoardSkeleton';
import BoardHeader from '@/components/board/BoardHeader';
import MembersDialog from '@/components/board/MembersDialog';
import ActivitySheet from '@/components/board/ActivitySheet';
import AddListForm from '@/components/board/AddListForm';
import AddListDialog from '@/components/board/AddListDialog';
import EditBoardDialog from '@/components/board/EditBoardDialog';
import BoardColumn from '@/components/board/BoardColumn';
import AddCardSheet from '@/components/board/AddCardSheet';
import BoardEmptyState from '@/components/board/BoardEmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { getId } from '@/lib/ids';
import { getErrorMessage } from '@/lib/errors';

import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* Hooks                                                                    */
/* -------------------------------------------------------------------------- */
import { useBoardListActions } from '@/hooks/board/useBoardListActions';
import { useBoardCardActions } from '@/hooks/board/useBoardCardActions';
import { useBoardCommentActions } from '@/hooks/board/useBoardCommentActions';
import { useBoardMemberActions } from '@/hooks/board/useBoardMemberActions';
import { useBoardActions } from '@/hooks/board/useBoardActions';
import { useBoardDragAndDrop } from '@/hooks/board/useBoardDragAndDrop';
import { useBoardSocket } from '@/hooks/board/useBoardSocket';
import BoardCanvas from '@/components/board/BoardCanvas';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

const sortLists = (items = []) =>
  [...items].sort(byOrder).map((list) => ({
    ...list,
    cards: [...(list.cards ?? [])].sort(byOrder),
  }));

// Fields a `board:updated` socket event must never overwrite, because the
// payload is not guaranteed to carry the fully populated versions of them.
const PROTECTED_BOARD_KEYS = new Set(['lists', 'members', 'myRole', 'isOwner']);

/**
 * Builds the toast body for an `activity:created` socket event.
 * Returns null for actions we do not announce.
 */
const describeActivity = (payload) => {
  const name = payload?.userId?.name || 'Someone';
  const meta = payload?.meta ?? {};
  const who = <strong className="font-semibold">{name}</strong>;

  switch (payload?.action) {
    // Lists
    case 'list:created':
      return (
        <span>
          {who} created the list “<strong>{meta.listTitle}</strong>”
        </span>
      );
    case 'list:updated':
      return (
        <span>
          {who} renamed the list from “<strong>{meta.oldListTitle}</strong>” to
          “<strong>{meta.newListTitle}</strong>”
        </span>
      );
    case 'list:deleted':
      return (
        <span>
          {who} deleted the list “<strong>{meta.listTitle}</strong>”
        </span>
      );

    // Cards
    case 'card:created':
      return (
        <span>
          {who} created card “<strong>{meta.cardTitle}</strong>” in{' '}
          <strong>{meta.listTitle}</strong>
        </span>
      );
    case 'card:moved':
      return (
        <span>
          {who} moved card “<strong>{meta.cardTitle}</strong>” from{' '}
          <strong>{meta.fromListTitle}</strong> to{' '}
          <strong>{meta.toListTitle}</strong>
        </span>
      );
    case 'card:deleted':
      return (
        <span>
          {who} deleted card “<strong>{meta.cardTitle}</strong>” from{' '}
          <strong>{meta.listTitle}</strong>
        </span>
      );

    // Comments
    case 'comment:created':
      return (
        <span>
          {who} commented on “<strong>{meta.cardTitle}</strong>”:{' '}
          <em>“{meta.commentPreview}”</em>
        </span>
      );
    case 'comment:deleted':
      return (
        <span>
          {who} deleted a comment on “<strong>{meta.cardTitle}</strong>”
        </span>
      );

    // Board
    case 'board:updated':
      return (
        <span>
          {who} updated the board details to “<strong>{meta.newTitle}</strong>”
        </span>
      );
    case 'board:deleted':
      return <span>{who} deleted the board</span>;

    // Members
    case 'board:member:invited':
      return (
        <span>
          {who} invited <strong>{meta.invitedUserName}</strong> as{' '}
          <strong>{meta.role}</strong>
        </span>
      );
    case 'board:member:inviteAccepted':
      return <span>{who} accepted the invitation to join this board</span>;
    case 'board:member:updated':
      return (
        <span>
          {who} changed <strong>{meta.targetUserName}&apos;s</strong> role to{' '}
          <strong>{meta.newRole}</strong>
        </span>
      );
    case 'board:member:deleted':
      return (
        <span>
          {who} removed <strong>{meta.deletedUserName}</strong> from the board
        </span>
      );

    default:
      return null;
  }
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const Board = () => {
  const params = useParams();
  const boardId = params.boardId ?? params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const {
    data: board,
    isLoading,
    isError,
    error: boardError,
    refetch,
  } = useGetBoardDetailsQuery(boardId, { skip: !boardId });

  const [activityPaginationState, setActivityPaginationState] = useState({
    boardId,
    page: 1,
  });

  const activityPage =
    activityPaginationState.boardId === boardId
      ? activityPaginationState.page
      : 1;

  const setActivityPage = (nextPage) => {
    setActivityPaginationState((current) => {
      const currentPage = current.boardId === boardId ? current.page : 1;

      const page =
        typeof nextPage === 'function' ? nextPage(currentPage) : nextPage;

      return { boardId, page };
    });
  };

  const {
    data: activityResponse,
    isLoading: isLoadingActivity,
    isFetching: isFetchingActivity,
    refetch: refetchActivity,
  } = useGetBoardActivityQuery(
    { boardId, page: activityPage },
    { skip: !boardId },
  );

  // Local copy of the lists so drag & drop can update the UI optimistically.
  // Its array order is the source of truth while a drop is being saved:
  // re-sorting by the persisted `order` on every render would make cards jump
  // back and forth before the server confirms the new order.
  const [localLists, setLocalLists] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [addListOpen, setAddListOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const myRole = board?.myRole;
  const isOwner = myRole === 'owner' || Boolean(board?.isOwner);
  const canEdit = ['owner', 'editor'].includes(myRole);

  const members = board?.members ?? [];
  const lists = localLists;
  const currentUserId = getId(currentUser);

  // Socket handlers read the current user from a ref so the socket effect does
  // not tear down and reconnect whenever the user object changes.
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  let selectedCard = null;
  let selectedCardList = null;

  if (selectedCardId) {
    for (const list of localLists) {
      const card = (list.cards ?? []).find(
        (item) => getId(item) === selectedCardId,
      );

      if (card) {
        selectedCard = card;
        selectedCardList = list;
        break;
      }
    }
  }

  const activities = activityResponse?.activities ?? [];

  const activityPagination = activityResponse?.pagination;
  const hasMoreActivity =
    activityPagination?.hasNextPage ??
    (activityPagination?.totalPages != null
      ? activityPage < activityPagination.totalPages
      : false);

  useEffect(() => {
    if (board?.lists) {
      setLocalLists(sortLists(board.lists));
    }
  }, [board?.lists]);

  const showError = useCallback((error, fallback) => {
    const message = getErrorMessage(error, fallback);
    toast.add({ type: 'error', description: message });
    return message;
  }, []);

  const showSuccess = useCallback((description) => {
    toast.add({ type: 'success', description });
  }, []);

  const { addList, renameList, updateList, deleteList } = useBoardListActions({
    boardId,
    canEdit,
    setDeleteDialog,
    showError,
    showSuccess,
  });

  const findListOfCard = (card) =>
    lists.find((item) =>
      (item.cards ?? []).some((itemCard) => getId(itemCard) === getId(card)),
    );

  const {
    addCard,
    saveCard,
    deleteCard,
    updateCard,
    isCreatingCard,
    isUpdatingCard,
  } = useBoardCardActions({
    boardId,
    canEdit,
    findListOfCard,
    setDeleteDialog,
    setSelectedCardId,
    showError,
    showSuccess,
    refetch,
  });

  const { addComment, deleteComment } = useBoardCommentActions({
    boardId,
    findListOfCard,
    currentUserId,
    isOwner,
    showError,
    showSuccess,
  });

  const { inviteMember, changeMemberRole, removeMember } =
    useBoardMemberActions({
      boardId,
      isOwner,
      setDeleteDialog,
      showError,
      showSuccess,
    });

  const { editBoard, deleteBoard } = useBoardActions({
    boardId,
    board,
    lists,
    members,
    isOwner,
    setDeleteDialog,
    showError,
    showSuccess,
    navigate,
  });

  const { persistCardPosition, handleMoveError, handleDragEnd } =
    useBoardDragAndDrop({
      boardId,
      lists,
      board,
      canEdit,
      updateCard,
      updateList,
      setLocalLists,
      sortLists,
      showError,
      refetch,
    });

  useBoardSocket({
    boardId,
    dispatch,
    navigate,
    showError,
    currentUserIdRef,
    protectedBoardKeys: PROTECTED_BOARD_KEYS,
    describeActivity,
  });
  /* ------------------------------- Actions -------------------------------- */
  const openCard = useCallback((card) => setSelectedCardId(getId(card)), []);

  // Shared by "Move up/down" and drag & drop.

  const moveCard = async (card, direction) => {
    if (!canEdit) return;

    const list = findListOfCard(card);
    if (!list) return;

    const cards = list.cards ?? [];
    const index = cards.findIndex((item) => getId(item) === getId(card));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= cards.length) return;

    const reordered = [...cards];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Optimistic update; the visible move is its own confirmation, so there is
    // no success toast for reordering.
    setLocalLists((current) =>
      current.map((item) =>
        getId(item) === getId(list) ? { ...item, cards: reordered } : item,
      ),
    );

    try {
      await persistCardPosition({
        card: moved,
        fromListId: list._id,
        toListId: list._id,
        previous: reordered[targetIndex - 1] ?? null,
        next: reordered[targetIndex + 1] ?? null,
      });
    } catch (error) {
      await handleMoveError(error);
    }
  };

  const openActivity = () => {
    setActivityOpen(true);

    // Always show a fresh first page when the sheet opens. Changing the page
    // triggers a fetch by itself; otherwise refetch the current (first) page.
    if (activityPage !== 1) setActivityPage(1);
    else refetchActivity();
  };

  const loadMoreActivity = () => {
    if (isFetchingActivity || !hasMoreActivity) return;
    setActivityPage((page) => page + 1);
  };

  /* -------------------------------- Render -------------------------------- */

  if (isLoading) return <BoardSkeleton />;

  if (isError || !board) {
    return (
      <div className="p-8 text-sm text-destructive" role="alert">
        {getErrorMessage(boardError, 'Failed to load board details.')}
        <button
          className="ml-3 underline"
          onClick={() => refetch()}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <BoardHeader
          members={members}
          isOwner={isOwner}
          myRole={myRole}
          canEdit={canEdit}
          onOpenMembers={() => setMembersOpen(true)}
          onOpenActivity={openActivity}
          onAddList={() => setAddListOpen(true)}
          onEdit={() => setEditBoardOpen(true)}
          onDelete={deleteBoard}
        />
      </div>

      <BoardCanvas
        boardId={boardId}
        lists={lists}
        members={members}
        canEdit={canEdit}
        isOwner={isOwner}
        currentUserId={currentUserId}
        isCreatingCard={isCreatingCard}
        onDragEnd={handleDragEnd}
        onOpenCard={openCard}
        onAddCard={addCard}
        onAddList={addList}
        onRenameList={renameList}
        onDeleteList={deleteList}
        onDeleteCard={deleteCard}
        onMoveCard={moveCard}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
      />

      <AddListDialog
        open={addListOpen}
        onOpenChange={setAddListOpen}
        onAddList={addList}
      />

      {isOwner && (
        <EditBoardDialog
          open={editBoardOpen}
          onOpenChange={setEditBoardOpen}
          board={board}
          onSubmit={editBoard}
        />
      )}

      <AddCardSheet
        open={Boolean(selectedCard)}
        onOpenChange={(open) => {
          if (!open) setSelectedCardId(null);
        }}
        card={selectedCard}
        listTitle={selectedCardList?.title ?? ''}
        members={members}
        isSubmitting={isUpdatingCard}
        onSubmit={(card, patch) => saveCard(card, patch)}
      />

      <MembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        members={members}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onInvite={inviteMember}
        onChangeRole={changeMemberRole}
        onRemove={removeMember}
      />

      <ActivitySheet
        open={activityOpen}
        onOpenChange={setActivityOpen}
        activities={activities}
        hasNextPage={Boolean(hasMoreActivity)}
        isLoading={isLoadingActivity}
        isLoadingMore={isFetchingActivity && activityPage > 1}
        onLoadMore={loadMoreActivity}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteDialog)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteDialog(null);
        }}
        title={deleteDialog?.title}
        description={deleteDialog?.description}
        itemName={deleteDialog?.itemName}
        details={deleteDialog?.details}
        onConfirm={async () => {
          if (!deleteDialog?.onConfirm || isDeleting) return;

          setIsDeleting(true);
          try {
            await deleteDialog.onConfirm();
          } finally {
            setIsDeleting(false);
          }
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Board;
