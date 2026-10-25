import {
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
} from '../../services/listApi';

export const useBoardListActions = ({
  boardId,
  canEdit,
  setDeleteDialog,
  showError,
  showSuccess,
}) => {
  const [createList] = useCreateListMutation();
  const [updateList] = useUpdateListMutation();
  const [deleteListMutation] = useDeleteListMutation();

  const addList = async (title) => {
    if (!canEdit) return;

    try {
      await createList({
        boardId,
        title: title.trim(),
      }).unwrap();

      showSuccess('List created successfully.');
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
          await deleteListMutation({
            boardId,
            listId: list._id,
          }).unwrap();

          showSuccess('List deleted successfully.');
          setDeleteDialog(null);
        } catch (error) {
          showError(error, 'Could not delete the list.');
        }
      },
    });
  };

  return {
    addList,
    renameList,
    updateList,
    deleteList,
  };
};
