import { getId } from '@/lib/ids';
import {
  useCreateCardMutation,
  useDeleteCardMutation,
  useUpdateCardMutation,
} from '@/services/cardApi';

export const useBoardCardActions = ({
  boardId,
  canEdit,
  findListOfCard,
  setDeleteDialog,
  setSelectedCardId,
  showError,
  showSuccess,
  refetch,
}) => {
  const [createCard, { isLoading: isCreatingCard }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdatingCard }] = useUpdateCardMutation();
  const [deleteCardMutation] = useDeleteCardMutation();

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

  return {
    addCard,
    saveCard,
    deleteCard,
    updateCard,
    isCreatingCard,
    isUpdatingCard,
  };
};
