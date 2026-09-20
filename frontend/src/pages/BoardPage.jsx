import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../services/boardsApi';
import {
  useCreateListMutation,
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
  const [errorMsg, setErrorMsg] = useState(null);

  const isUpdating = Boolean(listBody.id);

  const {
    data: board,
    isLoading: isBoardLoading,
    error: boardError,
  } = useGetBoardDetailsQuery(boardId);
  const [createList, { isLoading: isLoadingCreateList }] =
    useCreateListMutation();
  const [updateList] = useUpdateListMutation();

  const isAbleToUpdate = board?.myRole !== 'viewer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (isUpdating) {
        await updateList({
          boardId,
          listId: listBody.id,
          title: listBody.title,
        }).unwrap();
      } else {
        await createList({ boardId, title: listBody.title }).unwrap();
      }
      // Reset form on success
      setListBody({ id: null, title: '' });
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.data?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  const handleUpdateList = (list) => {
    setListBody({
      id: list._id,
      title: list.title,
      prevOrder: list.prevOrder,
      nextOrder: list.nextOrder,
    });
  };

  if (isBoardLoading)
    return <div className="loading-spinner">Loading board...</div>;
  if (boardError)
    return <div className="error-banner">Failed to load board details.</div>;

  return (
    <div className="board-page">
      <h1>Welcome, {currentUser?.name || 'User'}</h1>

      {errorMsg && <div className="alert-error">{errorMsg}</div>}

      {isAbleToUpdate && (
        <ListForm
          listBody={listBody}
          setListBody={setListBody}
          handleSubmit={handleSubmit}
          isUpdating={isUpdating}
          isLoadingCreateList={isLoadingCreateList}
          onCancel={
            isUpdating ? () => setListBody({ id: null, title: '' }) : undefined
          }
        />
      )}

      <div className="board-header">
        <h2>{board?.title}</h2>
        <p>{board?.description}</p>
      </div>

      <div className="board-lists-container">
        {board?.lists?.length > 0 ? (
          board.lists.map((list, index) => (
            <BoardList
              key={list._id}
              list={list}
              handleUpdateList={handleUpdateList}
              listIndex={index}
              updateList={updateList}
            />
          ))
        ) : (
          <p className="no-lists-text">
            No lists found. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default BoardPage;
