import { useState } from 'react';
import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../../services/boardsApi';
import { useDeleteCardMutation } from '../../services/cardApi';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '../../services/commentApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/authSlice';
import { Draggable } from '@hello-pangea/dnd';
import { formatDate } from '../../library/formatDate';

const BoardCard = ({
  card,
  setIsUpdate,
  setCardBody,
  updateCard,
  listIndex,
  cardIndex,
  list,
}) => {
  const { boardId } = useParams();
  const {
    data: board,
    refetch,
    isLoading: isBoardLoading,
  } = useGetBoardDetailsQuery(boardId);
  const [deleteCard, { isLoading: isLoadingDeleteCard }] =
    useDeleteCardMutation();

  const [createComment, { isLoading: isLoadingCreateComment }] =
    useCreateCommentMutation();
  const [deleteComment, { isLoading: isLoadingDeleteComment }] =
    useDeleteCommentMutation();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const currentUser = useSelector(selectCurrentUser);

  const isAbleToUpdate = ['owner', 'editor'].includes(board?.myRole);

  function moveCardUp({ cards }) {
    const card = cards[cardIndex];
    const prevCard = cards[cardIndex - 1];
    const beforePrevCard = cards[cardIndex - 2];

    if (!prevCard) return; // already at the top

    updateCard({
      boardId,
      listId: list._id,
      cardId: card._id,
      cardTitle: card.title,
      prevOrder: beforePrevCard ? beforePrevCard.order : null,
      nextOrder: prevCard.order,
    });
  }

  function moveCardDown({ cards }) {
    const card = cards[cardIndex];
    const nextCard = cards[cardIndex + 1]; // card currently below it
    const afterNextCard = cards[cardIndex + 2]; // card after that

    if (!nextCard) return; // already at the bottom, nothing to do

    updateCard({
      boardId,
      listId: list._id,
      cardId: card._id,
      cardTitle: card.title,
      prevOrder: nextCard.order,
      nextOrder: afterNextCard ? afterNextCard.order : null,
    });
  }

  const handleUpdate = () => {
    setIsUpdate(true);
    setCardBody({ id: card._id, title: card.title });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment({
      boardId,
      listId: list._id,
      cardId: card._id,
      text: commentText,
    });

    setCommentText(''); // Clear input after submission
  };

  return (
    <Draggable
      draggableId={card._id}
      index={cardIndex}
      isDragDisabled={!isAbleToUpdate}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            background: 'white',
            padding: '10px',
            marginBottom: '8px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* Main Card Header / Content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{card.title}</span>
            <div>
              {isAbleToUpdate && (
                <>
                  <button
                    onClick={() =>
                      moveCardUp({ cards: board.lists[listIndex].cards })
                    }
                  >
                    👆🏼
                  </button>
                  <button
                    onClick={() =>
                      moveCardDown({ cards: board.lists[listIndex].cards })
                    }
                  >
                    👇🏼
                  </button>
                  &nbsp; &nbsp;
                  <button onClick={handleUpdate}>Edit</button>
                  <button
                    onClick={() =>
                      deleteCard({
                        boardId,
                        listId: card.listId,
                        cardId: card._id,
                      })
                    }
                    disabled={isLoadingDeleteCard}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Comment Toggle Button */}
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                fontSize: '12px',
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              💬 Comments ({card.comments?.length || 0}){' '}
              {showComments ? '▲' : '▼'}
            </button>
          </div>

          {/* Inline Comment Section */}
          {showComments && (
            <div
              style={{
                marginTop: '8px',
                borderTop: '1px solid #eee',
                paddingTop: '8px',
              }}
            >
              {/* Comment Form */}
              <form
                onSubmit={handleCommentSubmit}
                style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}
              >
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                />
                <button type="submit" style={{ fontSize: '12px' }}>
                  Post
                </button>
              </form>

              {/* Comment List */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '12px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                }}
              >
                {card.comments && card.comments.length > 0 ? (
                  card.comments.map((comment) => (
                    <li
                      key={comment._id}
                      style={{
                        padding: '4px 0',
                        borderBottom: '1px solid #f9f9f9',
                      }}
                    >
                      {comment.text} &nbsp;&nbsp;&nbsp;&nbsp;
                      <span style={{ color: '#888' }}>
                        {comment.userId.name}
                        {comment.createdAt &&
                          ` | ${formatDate(comment.createdAt)}`}
                      </span>
                      {(comment.userId._id === currentUser._id ||
                        board.myRole === 'owner') && (
                        <button
                          onClick={() =>
                            deleteComment({
                              boardId,
                              listId: list._id,
                              cardId: card._id,
                              commentId: comment._id,
                            })
                          }
                        >
                          Delete
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#888', fontStyle: 'italic' }}>
                    No comments yet.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default BoardCard;
