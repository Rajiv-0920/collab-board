import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../../services/boardsApi';
import { useDeleteCardMutation } from '../../services/cardApi';
import { Draggable } from '@hello-pangea/dnd';

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
  const { data: board, isLoading: isBoardLoading } =
    useGetBoardDetailsQuery(boardId);
  const [deleteCard, { isLoading: isLoadingDeleteCard }] =
    useDeleteCardMutation();

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
          style={{ ...provided.draggableProps.style }}
        >
          {card.title}
          &nbsp; &nbsp;
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
                  deleteCard({ boardId, listId: card.listId, cardId: card._id })
                }
                disabled={isLoadingDeleteCard}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default BoardCard;
