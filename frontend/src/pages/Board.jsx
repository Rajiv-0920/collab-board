import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from '@/components/ui/toast';

import {
  boardsApi,
  useGetBoardDetailsQuery,
  useGetBoardActivityQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} from '../services/boardsApi';

import {
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
} from '../services/listApi';

import {
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
} from '../services/cardApi';

import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '../services/commentApi';

import { socket } from '../services/socket';
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

import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getId = (value) => String(value?._id ?? value?.id ?? value ?? '');

const getErrorMessage = (error, fallback) =>
  error?.data?.message || error?.message || fallback;

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

  // Activity is paginated: all pages live in one merged cache entry.
  const [activityPage, setActivityPage] = useState(1);

  const {
    data: activityResponse,
    isLoading: isLoadingActivity,
    isFetching: isFetchingActivity,
    refetch: refetchActivity,
  } = useGetBoardActivityQuery(
    { boardId, page: activityPage },
    { skip: !boardId },
  );

  const [createList] = useCreateListMutation();
  const [updateList] = useUpdateListMutation();
  const [deleteListMutation] = useDeleteListMutation();

  const [createCard, { isLoading: isCreatingCard }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdatingCard }] = useUpdateCardMutation();
  const [deleteCardMutation] = useDeleteCardMutation();

  const [createComment] = useCreateCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();

  const [updateBoardMutation] = useUpdateBoardMutation();
  const [deleteBoardMutation] = useDeleteBoardMutation();

  const [addMemberMutation] = useAddMemberMutation();
  const [updateMemberMutation] = useUpdateMemberMutation();
  const [removeMemberMutation] = useRemoveMemberMutation();

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

  const { selectedCard, selectedCardList } = useMemo(() => {
    if (!selectedCardId) return { selectedCard: null, selectedCardList: null };

    for (const list of localLists) {
      const card = (list.cards ?? []).find(
        (item) => getId(item) === selectedCardId,
      );
      if (card) return { selectedCard: card, selectedCardList: list };
    }

    return { selectedCard: null, selectedCardList: null };
  }, [localLists, selectedCardId]);

  const activities = activityResponse?.activities ?? [];

  const activityPagination = activityResponse?.pagination;
  const hasMoreActivity =
    activityPagination?.hasNextPage ??
    (activityPagination?.totalPages != null
      ? activityPage < activityPagination.totalPages
      : false);

  // Switching boards starts the feed from the first page again.
  useEffect(() => {
    setActivityPage(1);
  }, [boardId]);

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

  /* ------------------------------ Real-time ------------------------------- */

  // Socket handlers update the canonical RTK Query cache.
  // localLists follows board.lists through the effect above.
  useEffect(() => {
    if (!boardId) return undefined;

    let hasJoinedBefore = false;

    const patchBoard = (recipe) => {
      dispatch(
        boardsApi.util.updateQueryData('getBoardDetails', boardId, (draft) => {
          if (draft) recipe(draft);
        }),
      );
    };

    const refreshBoard = () => {
      dispatch(
        boardsApi.util.invalidateTags(['Boards', 'List', 'Card', 'Comment']),
      );
    };

    const onConnect = () => {
      socket.emit('joinBoard', boardId, (response) => {
        if (response?.success === false) {
          showError(
            { data: { message: response.message } },
            'Could not join this board.',
          );
          navigate('/dashboard', { replace: true });
        }
      });

      // After a reconnect we may have missed events while offline.
      if (hasJoinedBefore) refreshBoard();
      hasJoinedBefore = true;
    };

    const onBoardUpdated = (updatedBoard) => {
      patchBoard((draft) => {
        Object.entries(updatedBoard ?? {}).forEach(([key, value]) => {
          if (!PROTECTED_BOARD_KEYS.has(key)) draft[key] = value;
        });
      });
    };

    const onBoardDeleted = (payload) => {
      if (payload?.boardId && getId(payload.boardId) !== getId(boardId)) {
        return;
      }

      dispatch(boardsApi.util.invalidateTags(['Boards']));
      navigate('/dashboard', { replace: true });
    };

    const onListCreated = (newList) => {
      patchBoard((draft) => {
        draft.lists ??= [];
        if (!draft.lists.some((list) => getId(list) === getId(newList))) {
          draft.lists.push({ ...newList, cards: newList.cards ?? [] });
        }
      });
    };

    const onListUpdated = (updatedList) => {
      patchBoard((draft) => {
        const index = (draft.lists ?? []).findIndex(
          (list) => getId(list) === getId(updatedList),
        );

        if (index >= 0) {
          draft.lists[index] = { ...draft.lists[index], ...updatedList };
          draft.lists.sort(byOrder);
        }
      });
    };

    const onListDeleted = (payload) => {
      const deletedId = getId(payload?.listId ?? payload);
      patchBoard((draft) => {
        draft.lists = (draft.lists ?? []).filter(
          (list) => getId(list) !== deletedId,
        );
      });
    };

    const onCardCreated = (newCard) => {
      patchBoard((draft) => {
        const list = (draft.lists ?? []).find(
          (item) => getId(item) === getId(newCard.listId),
        );
        if (!list) return;

        list.cards ??= [];
        if (!list.cards.some((card) => getId(card) === getId(newCard))) {
          list.cards.push(newCard);
          list.cards.sort(byOrder);
        }
      });
    };

    const onCardUpdated = (payload) => {
      // Existing server event shape: { result, isMoved }.
      const updatedCard = payload?.result ?? payload;
      if (!updatedCard?._id) {
        refreshBoard();
        return;
      }

      const cardId = getId(updatedCard);
      const destinationListId = getId(updatedCard.listId);

      let destinationMissing = false;
      patchBoard((draft) => {
        let existingCard = null;

        for (const list of draft.lists ?? []) {
          const index = list.cards?.findIndex((card) => getId(card) === cardId);

          if (index >= 0) {
            existingCard = list.cards[index];
            list.cards.splice(index, 1);
            break;
          }
        }

        const targetList = (draft.lists ?? []).find(
          (list) => getId(list) === destinationListId,
        );

        if (!targetList) {
          destinationMissing = true;
          return;
        }

        targetList.cards ??= [];

        const mergedCard = existingCard
          ? { ...existingCard, ...updatedCard }
          : updatedCard;

        const duplicateIndex = targetList.cards.findIndex(
          (card) => getId(card) === cardId,
        );

        if (duplicateIndex >= 0) {
          targetList.cards[duplicateIndex] = mergedCard;
        } else {
          targetList.cards.push(mergedCard);
        }

        targetList.cards.sort(byOrder);
      });

      if (destinationMissing) refreshBoard();
    };

    const onCardDeleted = (payload) => {
      const deletedId = getId(payload?.cardId ?? payload);
      patchBoard((draft) => {
        for (const list of draft.lists ?? []) {
          list.cards = (list.cards ?? []).filter(
            (card) => getId(card) !== deletedId,
          );
        }
      });
    };

    const onCommentCreated = (comment) => {
      patchBoard((draft) => {
        const cardId = getId(comment.cardId);

        for (const list of draft.lists ?? []) {
          const card = (list.cards ?? []).find(
            (item) => getId(item) === cardId,
          );
          if (!card) continue;

          card.comments ??= [];
          if (!card.comments.some((item) => getId(item) === getId(comment))) {
            card.comments.push(comment);
          }
          break;
        }
      });
    };

    const onCommentDeleted = (payload) => {
      const comment = payload?.comment ?? payload;
      const cardId = getId(comment.cardId);
      const commentId = getId(comment._id ?? comment.commentId);

      patchBoard((draft) => {
        for (const list of draft.lists ?? []) {
          const card = (list.cards ?? []).find(
            (item) => getId(item) === cardId,
          );
          if (card) {
            card.comments = (card.comments ?? []).filter(
              (item) => getId(item) !== commentId,
            );
            break;
          }
        }
      });
    };

    const onMemberInvited = (member) => {
      patchBoard((draft) => {
        draft.members ??= [];
        const userId = getId(member.userId);
        if (!draft.members.some((item) => getId(item.userId) === userId)) {
          draft.members.push(member);
        }
      });
    };

    const onMemberUpdated = (payload) => {
      patchBoard((draft) => {
        const userId = getId(payload.userId);
        const member = draft.members?.find(
          (item) => getId(item.userId) === userId,
        );
        if (member) member.role = payload.role;

        // If it's *my* role that changed, update what the UI permissions use.
        if (userId === currentUserIdRef.current) {
          draft.myRole = payload.role;
        }
      });
    };

    const onMemberDeleted = (payload) => {
      const removedUserId = getId(payload?.userId ?? payload);

      if (removedUserId === currentUserIdRef.current) {
        dispatch(boardsApi.util.invalidateTags(['Boards']));
        navigate('/dashboard', { replace: true });
        return;
      }

      patchBoard((draft) => {
        draft.members = (draft.members ?? []).filter(
          (member) => getId(member.userId) !== removedUserId,
        );
      });
    };

    const onActivityCreated = (payload) => {
      if (!payload) return;

      // Everyone (including the actor) gets the entry at the top of the feed.
      dispatch(
        boardsApi.util.updateQueryData(
          'getBoardActivity',
          { boardId },
          (draft) => {
            if (!draft?.activities) return;

            const id = payload._id ?? payload.id;
            if (
              id &&
              draft.activities.some((item) => getId(item) === String(id))
            ) {
              return;
            }
            draft.activities.unshift(payload);
          },
        ),
      );

      // The person who did the action already got a success toast.
      if (getId(payload.userId) === currentUserIdRef.current) return;

      const description = describeActivity(payload);
      if (description) toast.add({ type: 'success', description });
    };

    const eventHandlers = [
      ['connect', onConnect],
      ['board:updated', onBoardUpdated],
      ['board:deleted', onBoardDeleted],
      ['list:created', onListCreated],
      ['list:updated', onListUpdated],
      ['list:deleted', onListDeleted],
      ['card:created', onCardCreated],
      ['card:updated', onCardUpdated],
      ['card:deleted', onCardDeleted],
      ['comment:created', onCommentCreated],
      ['comment:deleted', onCommentDeleted],
      ['board:member:inviteAccepted', onMemberInvited],
      ['board:member:updated', onMemberUpdated],
      ['board:member:deleted', onMemberDeleted],
      ['activity:created', onActivityCreated],
    ];

    eventHandlers.forEach(([event, handler]) => socket.on(event, handler));

    if (!socket.connected) socket.connect();
    else onConnect();

    return () => {
      eventHandlers.forEach(([event, handler]) => socket.off(event, handler));

      if (socket.connected) socket.emit('leaveBoard', boardId);
      socket.disconnect();
    };
  }, [boardId, dispatch, navigate, showError]);

  /* ------------------------------- Actions -------------------------------- */

  const findListOfCard = (card) =>
    lists.find((item) =>
      (item.cards ?? []).some((itemCard) => getId(itemCard) === getId(card)),
    );

  const openCard = useCallback((card) => setSelectedCardId(getId(card)), []);

  const addList = async (title) => {
    if (!canEdit) return;

    try {
      await createList({ boardId, title: title.trim() }).unwrap();
      showSuccess('List created successfully.');
      // Mutation invalidation refreshes board details.
    } catch (error) {
      showError(error, 'Could not create the list.');
      throw error;
    }
  };

  const renameList = async (list, title) => {
    if (!canEdit) return;

    try {
      await updateList({
        boardId,
        listId: list._id,
        title: title.trim(),
      }).unwrap();
      showSuccess('List renamed successfully.');
    } catch (error) {
      showError(error, 'Could not rename the list.');
      throw error;
    }
  };

  const deleteList = (list) => {
    if (!canEdit) return;

    const cardCount = list.cards?.length ?? 0;

    setDeleteDialog({
      title: 'Delete this list?',
      description: cardCount
        ? `This will permanently delete this list and its ${cardCount} card(s). You can't undo this.`
        : "This will permanently delete this list. You can't undo this.",
      itemName: list.title,
      details: `${cardCount} ${cardCount === 1 ? 'card' : 'cards'}`,
      onConfirm: async () => {
        try {
          await deleteListMutation({ boardId, listId: list._id }).unwrap();
          showSuccess('List deleted successfully.');
          setDeleteDialog(null);
        } catch (error) {
          showError(error, 'Could not delete the list.');
        }
      },
    });
  };

  const addCard = async (list, card) => {
    if (!canEdit) return;

    try {
      await createCard({
        boardId,
        listId: list._id,
        cardBody: { ...card },
      }).unwrap();
      showSuccess('Card created successfully.');
    } catch (error) {
      showError(error, 'Could not create the card.');
      throw error;
    }
  };

  const saveCard = async (card, patch) => {
    if (!canEdit) return;

    const list = findListOfCard(card);
    if (!list) throw new Error('Could not find the card’s list.');

    const assigneeIds = (
      Array.isArray(patch.assigneeIds) ? patch.assigneeIds : []
    )
      .map(getId)
      .filter(Boolean);

    try {
      await updateCard({
        boardId,
        listId: list._id,
        cardId: getId(card),
        cardBody: {
          title: patch.title,
          description: patch.description ?? '',
          dueDate: patch.dueDate || null,
          labels: patch.labels ?? [],
          assigneeIds,
          version: patch.version ?? card.version,
        },
      }).unwrap();

      showSuccess('Card updated successfully.');
      setSelectedCardId(null);
    } catch (error) {
      if (error?.status === 409) {
        await refetch();
        showError(
          error,
          'This card changed elsewhere. The latest version has been loaded; please review your changes.',
        );
      } else {
        showError(error, 'Could not save the card.');
      }
      throw error;
    }
  };

  const deleteCard = (card) => {
    if (!canEdit) return;

    const list = findListOfCard(card);
    if (!list) return;

    setDeleteDialog({
      title: 'Delete this card?',
      description:
        "This card will be permanently deleted. You can't undo this.",
      itemName: card.title,
      details: `List: ${list.title}`,
      onConfirm: async () => {
        try {
          await deleteCardMutation({
            boardId,
            listId: list._id,
            cardId: card._id,
          }).unwrap();

          showSuccess('Card deleted successfully.');
          setSelectedCardId(null);
          setDeleteDialog(null);
        } catch (error) {
          showError(error, 'Could not delete the card.');
        }
      },
    });
  };

  // Shared by "Move up/down" and drag & drop.
  const persistCardPosition = ({
    card,
    fromListId,
    toListId,
    previous,
    next,
  }) =>
    updateCard({
      boardId,
      listId: fromListId,
      cardId: card._id,
      newListId: toListId !== fromListId ? toListId : undefined,
      cardBody: {
        title: card.title,
        description: card.description ?? '',
        dueDate: card.dueDate ?? null,
        labels: card.labels ?? [],
        assigneeIds: (card.assigneeIds ?? []).map(getId),
        version: card.version,
        prevOrder: previous?.order ?? null,
        nextOrder: next?.order ?? null,
      },
    }).unwrap();

  const handleMoveError = async (error) => {
    setLocalLists(sortLists(board?.lists ?? []));

    if (error?.status === 409) {
      await refetch();
      showError(
        error,
        'The card changed elsewhere. The board has been refreshed.',
      );
    } else {
      showError(error, 'Could not move the card.');
    }
  };

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

  const addComment = async (card, text) => {
    if (!text.trim()) return;

    const list = findListOfCard(card);
    if (!list) throw new Error('Could not find the card’s list.');

    try {
      await createComment({
        boardId,
        listId: list._id,
        cardId: card._id,
        text: text.trim(),
      }).unwrap();
      showSuccess('Comment added successfully.');
    } catch (error) {
      showError(error, 'Could not add the comment.');
      throw error;
    }
  };

  const deleteComment = async (card, comment) => {
    const list = findListOfCard(card);
    if (!list) return;

    if (getId(comment.userId) !== currentUserId && !isOwner) {
      showError(null, 'Only the comment author or board owner can delete it.');
      return;
    }

    try {
      await deleteCommentMutation({
        boardId,
        listId: list._id,
        cardId: card._id,
        commentId: comment._id,
      }).unwrap();
      showSuccess('Comment deleted successfully.');
    } catch (error) {
      showError(error, 'Could not delete the comment.');
      throw error;
    }
  };

  const handleDragEnd = async ({ source, destination, type }) => {
    if (!canEdit || !destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === 'LIST') {
      const reordered = [...lists];
      const [moved] = reordered.splice(source.index, 1);
      if (!moved) return;

      reordered.splice(destination.index, 0, moved);
      setLocalLists(reordered);

      try {
        await updateList({
          boardId,
          listId: moved._id,
          title: moved.title,
          prevOrder: reordered[destination.index - 1]?.order ?? null,
          nextOrder: reordered[destination.index + 1]?.order ?? null,
        }).unwrap();
      } catch (error) {
        setLocalLists(sortLists(board?.lists ?? []));
        showError(error, 'Could not reorder the lists.');
      }
      return;
    }

    if (type !== 'CARD') return;

    const sourceIndex = lists.findIndex(
      (list) => getId(list) === source.droppableId,
    );
    const destinationIndex = lists.findIndex(
      (list) => getId(list) === destination.droppableId,
    );

    if (sourceIndex < 0 || destinationIndex < 0) return;

    const reordered = lists.map((list) => ({
      ...list,
      cards: [...(list.cards ?? [])],
    }));

    const [moved] = reordered[sourceIndex].cards.splice(source.index, 1);
    if (!moved) return;

    reordered[destinationIndex].cards.splice(destination.index, 0, moved);
    setLocalLists(reordered);

    const destinationCards = reordered[destinationIndex].cards;

    try {
      await persistCardPosition({
        card: moved,
        fromListId: source.droppableId,
        toListId: destination.droppableId,
        previous: destinationCards[destination.index - 1] ?? null,
        next: destinationCards[destination.index + 1] ?? null,
      });
    } catch (error) {
      await handleMoveError(error);
    }
  };

  const inviteMember = async ({ email, role }) => {
    if (!isOwner) return;

    try {
      await addMemberMutation({ boardId, email, role }).unwrap();
      showSuccess(`Invitation sent to ${email}.`);
    } catch (error) {
      showError(error, 'Could not invite this member.');
      throw error;
    }
  };

  const changeMemberRole = async (member, role) => {
    if (!isOwner) return;

    try {
      await updateMemberMutation({
        boardId,
        memberId: getId(member.userId),
        role,
      }).unwrap();
      showSuccess('Member role updated successfully.');
    } catch (error) {
      showError(error, 'Could not update the member role.');
      throw error;
    }
  };

  const removeMember = (member) => {
    if (!isOwner) return;

    const memberName = member.userId?.name ?? 'this member';

    setDeleteDialog({
      title: 'Remove this member?',
      description:
        'This member will lose access to this board. You can invite them again later.',
      itemName: memberName,
      details: member.userId?.email ?? 'Board member',
      onConfirm: async () => {
        try {
          await removeMemberMutation({
            boardId,
            memberId: getId(member.userId),
          }).unwrap();

          showSuccess('Member removed successfully.');
          setDeleteDialog(null);
        } catch (error) {
          showError(error, 'Could not remove the member.');
        }
      },
    });
  };

  // Called by EditBoardDialog with `{ title, description }`.
  const editBoard = async (values) => {
    if (!isOwner) return;

    const body = values ?? {};

    if (!body.title?.trim()) {
      showError(null, 'Board title cannot be empty.');
      return;
    }

    try {
      await updateBoardMutation({
        id: boardId,
        body: {
          ...body,
          title: body.title.trim(),
          description: body.description ?? '',
        },
      }).unwrap();
      showSuccess('Board updated successfully.');
    } catch (error) {
      showError(error, 'Could not update the board.');
      throw error;
    }
  };

  const deleteBoard = () => {
    if (!isOwner) return;

    const taskCount = lists.reduce(
      (total, list) => total + (list.cards?.length ?? 0),
      0,
    );

    setDeleteDialog({
      title: 'Delete this board?',
      description:
        "This will permanently delete the board for everyone. You can't undo this.",
      itemName: board.title,
      details: `${lists.length} ${lists.length === 1 ? 'list' : 'lists'} · ${taskCount} ${taskCount === 1 ? 'card' : 'cards'} · ${members.length} ${members.length === 1 ? 'member' : 'members'}`,
      onConfirm: async () => {
        try {
          await deleteBoardMutation(boardId).unwrap();
          showSuccess('Board deleted successfully.');
          setDeleteDialog(null);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          showError(error, 'Could not delete the board.');
        }
      },
    });
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

      {/*
        The ONLY scroll container of the board (both axes). Columns and card
        lists must not scroll on their own: @hello-pangea/dnd auto-scrolls the
        closest scrollable ancestor of the droppable you are over, so nested
        scrollers would block horizontal auto-scroll while dragging cards.
        Sticky list headers stick to the top of this container.
      */}
      <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId={String(boardId)}
            direction="horizontal"
            type="LIST"
            isDropDisabled={!canEdit}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex w-max min-w-full items-start gap-3 sm:gap-4',
                  'px-3 pb-6 pt-3 sm:pt-4',
                  snapshot.isDraggingOver && 'bg-muted/30',
                )}
              >
                {lists.map((list, index) => (
                  <BoardColumn
                    key={String(list._id)}
                    list={list}
                    listIndex={index}
                    members={members}
                    canEdit={canEdit}
                    isOwner={isOwner}
                    currentUserId={currentUserId}
                    isCreatingCard={isCreatingCard}
                    onOpenCard={openCard}
                    onAddCard={addCard}
                    onRenameList={renameList}
                    onDeleteList={deleteList}
                    onDeleteCard={deleteCard}
                    onMoveCard={moveCard}
                    onAddComment={addComment}
                    onDeleteComment={deleteComment}
                  />
                ))}

                {provided.placeholder}

                {canEdit && <AddListForm onAddList={addList} />}

                {!canEdit && lists.length === 0 && <BoardEmptyState />}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

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
