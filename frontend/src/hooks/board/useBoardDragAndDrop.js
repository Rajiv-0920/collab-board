import { getId } from '@/lib/ids';

export const useBoardDragAndDrop = ({
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
}) => {
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

  return {
    persistCardPosition,
    handleMoveError,
    handleDragEnd,
    moveCard,
  };
};
