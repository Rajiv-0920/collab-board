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
import BoardList from '../components/board/BoardList';
import ListForm from '../components/board/ListForm';

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
