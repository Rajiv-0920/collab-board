import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../../services/boardsApi';
import { useState } from 'react';
import {
  useCreateCardMutation,
  useUpdateCardMutation,
} from '../../services/cardApi';
import BoardCard from './BoardCard';
import CardForm from './CardForm';
import { useDeleteListMutation } from '../../services/listApi';

const BoardList = ({ list, handleUpdateList, listIndex, updateList }) => {
  const { boardId } = useParams();
  const { data: board, isLoading: isBoardLoading } =
    useGetBoardDetailsQuery(boardId);
  const [deleteList, { isLoading: isLoadingDeleteList }] =
    useDeleteListMutation();
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

export default BoardList;
