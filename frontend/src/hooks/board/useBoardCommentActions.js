import { getId } from '@/lib/ids';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '@/services/commentApi';

export const useBoardCommentActions = ({
  boardId,
  findListOfCard,
  currentUserId,
  isOwner,
  showError,
  showSuccess,
}) => {
  const [createComment] = useCreateCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();

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

  return {
    addComment,
    deleteComment,
  };
};
