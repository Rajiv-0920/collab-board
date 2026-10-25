import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

/* -------------------------------------------------------------------------- */
/* Slice and APIs                                                                    */
/* -------------------------------------------------------------------------- */
import { useGetBoardDetailsQuery } from '../services/boardsApi';
import { selectCurrentUser } from '../store/authSlice';

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */
import { getId } from '@/lib/ids';
import { getErrorMessage } from '@/lib/errors';
import describeActivity from '@/lib/describeBoardActivity';

/* -------------------------------------------------------------------------- */
/* Components                                                                    */
/* -------------------------------------------------------------------------- */
import BoardCanvas from '@/components/board/BoardCanvas';
import BoardOverlays from '@/components/board/BoardOverlays';
import BoardSkeleton from '@/components/board/BoardSkeleton';
import BoardHeader from '@/components/board/BoardHeader';
import AddListDialog from '@/components/board/AddListDialog';
import { toast } from '@/components/ui/toast';

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
import { useBoardActivity } from '@/hooks/board/useBoardActivity';

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

  const {
    activities,
    page: activityPage,
    setPage: setActivityPage,
    hasMore: hasMoreActivity,
    isLoading: isLoadingActivity,
    isFetching: isFetchingActivity,
    refetch: refetchActivity,
  } = useBoardActivity(boardId);
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

      <BoardOverlays
        isOwner={isOwner}
        editBoardOpen={editBoardOpen}
        setEditBoardOpen={setEditBoardOpen}
        board={board}
        editBoard={editBoard}
        selectedCard={selectedCard}
        setSelectedCardId={setSelectedCardId}
        selectedCardList={selectedCardList}
        members={members}
        isUpdatingCard={isUpdatingCard}
        saveCard={saveCard}
        membersOpen={membersOpen}
        setMembersOpen={setMembersOpen}
        currentUserId={currentUserId}
        inviteMember={inviteMember}
        changeMemberRole={changeMemberRole}
        removeMember={removeMember}
        activityOpen={activityOpen}
        setActivityOpen={setActivityOpen}
        activities={activities}
        hasMoreActivity={hasMoreActivity}
        isLoadingActivity={isLoadingActivity}
        isFetchingActivity={isFetchingActivity}
        activityPage={activityPage}
        loadMoreActivity={loadMoreActivity}
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
      />
    </div>
  );
};

export default Board;
