import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../services/boardsApi';
import {
  useCreateListMutation,
  useDeleteListMutation,
  useUpdateListMutation,
} from '../services/listApi';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import {
  useCreateCardMutation,
  useDeleteCardMutation,
  useUpdateCardMutation,
} from '../services/cardApi';

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

  const isAbleToUpdate = board?.myRole !== 'viewer';

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
    <div>
      {card.title}
      &nbsp; &nbsp;
      {isAbleToUpdate && (
        <>
          <button
            onClick={() => moveCardUp({ cards: board.lists[listIndex].cards })}
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
      {/* Todo: Fix Edit button and Add Delete button as well */}
    </div>
  );
};

const CardForm = ({
  handleSubmit,
  cardBody,
  setCardBody,
  isLoading,
  isUpdate,
}) => {
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          onChange={(e) => setCardBody({ ...cardBody, title: e.target.value })}
          value={cardBody.title}
          placeholder="Card title"
        />
        <button type="submit" disabled={isLoading}>
          {isUpdate ? 'Update Card' : 'Add Card'}
        </button>
      </form>
    </>
  );
};

const BoardList = ({
  list,
  handleUpdateList,
  deleteList,
  isLoadingDeleteList,
  listIndex,
  updateList,
}) => {
  const { boardId } = useParams();
  const { data: board, isLoading: isBoardLoading } =
    useGetBoardDetailsQuery(boardId);
  const isAbleToUpdate = board?.myRole !== 'viewer';
  const [cardBody, setCardBody] = useState({ id: null, title: '' });
  const [createCard, { isLoading: isLoadingCreateCard }] =
    useCreateCardMutation();
  const [updateCard, { isLoading: isLoadingUpdateCard }] =
    useUpdateCardMutation();
  const [isUpdate, setIsUpdate] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUpdate) {
        await updateCard({
          boardId,
          listId: list._id,
          cardId: cardBody.id,
          cardTitle: cardBody.title,
        }).unwrap();
      } else {
        await createCard({
          boardId,
          listId: list._id,
          cardTitle: cardBody.title,
        }).unwrap();
      }
      setIsUpdate(false);
      setCardBody({ id: null, title: '' });
    } catch (error) {
      console.error(error);
    }
  };

  function moveListUp() {
    const list = board.lists[listIndex];
    const prevList = board.lists[listIndex - 1];
    const beforePrevList = board.lists[listIndex - 2];

    if (!prevList) return; // already at the top

    updateList({
      boardId,
      listId: list._id,
      listTitle: list.title,
      prevOrder: beforePrevList ? beforePrevList.order : null,
      nextOrder: prevList.order,
    });
  }

  function moveListDown() {
    const lists = board.lists;
    const currentList = lists[listIndex];
    const nextList = lists[listIndex + 1];
    const afterNextList = lists[listIndex + 2];

    if (!nextList) return; // already at the bottom

    updateList({
      boardId,
      listId: currentList._id,
      listTitle: currentList.title,
      prevOrder: nextList.order,
      nextOrder: afterNextList ? afterNextList.order : null,
    });
  }

  return (
    <div>
      <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
        {list.title}&nbsp; &nbsp; &nbsp; &nbsp;
        {isAbleToUpdate && (
          <>
            <button onClick={moveListUp}>^</button>
            <button onClick={moveListDown}>v</button>
            &nbsp; &nbsp;
            <button onClick={() => handleUpdateList(list)}>Update</button>
            <button
              onClick={() => deleteList({ boardId, listId: list._id })}
              disabled={isLoadingDeleteList}
            >
              Delete
            </button>
          </>
        )}
      </p>

      <div>
        {isAbleToUpdate && (
          <CardForm
            handleSubmit={handleSubmit}
            cardBody={cardBody}
            setCardBody={setCardBody}
            isUpdate={isUpdate}
            isLoading={isLoadingCreateCard || isLoadingUpdateCard}
          />
        )}
        {list.cards.length <= 0 ? (
          <div style={{ color: 'gray' }}>No cards</div>
        ) : (
          list.cards.map((card, index) => (
            <BoardCard
              key={card._id}
              card={card}
              setCardBody={setCardBody}
              setIsUpdate={setIsUpdate}
              updateCard={updateCard}
              listIndex={listIndex}
              cardIndex={index}
              list={list}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ListForm = ({
  listBody,
  setListBody,
  handleSubmit,
  isUpdating,
  isLoadingCreateList,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={(e) => setListBody({ ...listBody, title: e.target.value })}
        value={listBody.title}
        name="title"
        placeholder="List title"
      />
      <button type="submit" disabled={isLoadingCreateList}>
        {isUpdating ? 'Updating...' : 'Add List'}
      </button>
    </form>
  );
};

const BoardPage = () => {
  const { boardId } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const [listBody, setListBody] = useState({ id: null, title: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: board, isLoading: isBoardLoading } =
    useGetBoardDetailsQuery(boardId);
  const [createList, { isLoading: isLoadingCreateList }] =
    useCreateListMutation();
  const [deleteList, { isLoading: isLoadingDeleteList }] =
    useDeleteListMutation();
  const [updateList] = useUpdateListMutation();

  const isAbleToUpdate = board?.myRole !== 'viewer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUpdating) {
        await updateList({
          boardId,
          listId: listBody.id,
          title: listBody.title,
        }).unwrap();
        setIsUpdating(false);
      } else {
        await createList({ boardId, title: listBody.title }).unwrap();
      }
      setListBody({ id: null, title: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateList = (list) => {
    setIsUpdating(true);
    setListBody({
      id: list._id,
      title: list.title,
      prevOrder: list.prevOrder,
      nextOrder: list.nextOrder,
    });
  };

  if (isBoardLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>

      {isAbleToUpdate && (
        <ListForm
          listBody={listBody}
          setListBody={setListBody}
          handleSubmit={handleSubmit}
          isUpdating={isUpdating}
          isLoadingCreateList={isLoadingCreateList}
        />
      )}

      <h2>{board.title}</h2>
      <p>{board.description}</p>

      <div>
        {board.lists &&
          board.lists.map((list, index) => (
            <BoardList
              key={list._id}
              list={list}
              handleUpdateList={handleUpdateList}
              deleteList={deleteList}
              isLoadingDeleteList={isLoadingDeleteList}
              listIndex={index}
              updateList={updateList}
            />
          ))}
      </div>
    </div>
  );
};

export default BoardPage;
