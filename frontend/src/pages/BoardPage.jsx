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

const BoardCard = ({ card }) => {
  return <div>{card.title}</div>;
};

const BoardList = ({
  list,
  boardId,
  isAbleToUpdate,
  handleUpdateList,
  deleteList,
  isLoadingDeleteList,
}) => {
  return (
    <div>
      <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
        {list.title}&nbsp; &nbsp; &nbsp; &nbsp;
        {isAbleToUpdate && (
          <>
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
        {list.cards.length <= 0 ? (
          <div style={{ color: 'gray' }}>No cards</div>
        ) : (
          list.cards.map((card) => <BoardCard key={card._id} card={card} />)
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
    setListBody({ id: list._id, title: list.title });
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
          board.lists.map((list) => (
            <BoardList
              key={list._id}
              list={list}
              boardId={board._id}
              isAbleToUpdate={isAbleToUpdate}
              handleUpdateList={handleUpdateList}
              deleteList={deleteList}
              isLoadingDeleteList={isLoadingDeleteList}
            />
          ))}
      </div>
    </div>
  );
};

export default BoardPage;
