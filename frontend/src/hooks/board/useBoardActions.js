import {
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} from '../../services/boardsApi';

export const useBoardActions = ({
  boardId,
  board,
  lists,
  members,
  isOwner,
  setDeleteDialog,
  showError,
  showSuccess,
  navigate,
}) => {
  const [updateBoardMutation] = useUpdateBoardMutation();
  const [deleteBoardMutation] = useDeleteBoardMutation();

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

  return {
    editBoard,
    deleteBoard,
  };
};
