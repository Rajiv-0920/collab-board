import { useEffect } from 'react';

import { toast } from '@/components/ui/toast';
import { getId } from '@/lib/ids';

import { socket } from '../../services/socket';
import { boardsApi } from '../../services/boardsApi';

export const useBoardSocket = ({
  boardId,
  dispatch,
  navigate,
  showError,
  currentUserIdRef,
  protectedBoardKeys,
  describeActivity,
}) => {
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

      if (hasJoinedBefore) refreshBoard();
      hasJoinedBefore = true;
    };

    const onBoardUpdated = (updatedBoard) => {
      patchBoard((draft) => {
        Object.entries(updatedBoard ?? {}).forEach(([key, value]) => {
          if (!protectedBoardKeys.has(key)) draft[key] = value;
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
  }, [
    boardId,
    dispatch,
    navigate,
    showError,
    currentUserIdRef,
    protectedBoardKeys,
    describeActivity,
  ]);
};

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
