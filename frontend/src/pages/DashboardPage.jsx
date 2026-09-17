import { useState } from 'react';
import {
  useCreateBoardMutation,
  useGetBoardsQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} from '../services/boardsApi';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';

const DashboardPage = () => {
  const [boardBody, setBoardBody] = useState({
    id: '',
    title: '',
    description: '',
  });
  const { data: boards, isLoading: isBoardsLoading } = useGetBoardsQuery();
  const [createBoard, { isLoading: isCreating, isError }] =
    useCreateBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
  const [deleteBoard, { isLoading: isDeleting }] = useDeleteBoardMutation();
  const [isUpdate, setIsUpdate] = useState(false);
  const isLoading = isCreating || isUpdating;
  const currentUser = useSelector(selectCurrentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isUpdate) {
        const result = await updateBoard({
          id: boardBody.id,
          body: boardBody,
        }).unwrap();
        setIsUpdate(false);
      } else {
        const result = await createBoard(boardBody).unwrap();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setBoardBody({ title: '', description: '' });
    }
  };

  const handleUpdate = async (body) => {
    setIsUpdate(true);
    setBoardBody({
      id: body._id,
      title: body.title,
      description: body.description,
    });
  };

  return (
    <div>
      <h2>Create Board</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={boardBody.title}
          onChange={(e) =>
            setBoardBody({ ...boardBody, title: e.target.value })
          }
          placeholder="Board title"
        />
        <input
          type="text"
          value={boardBody.description}
          onChange={(e) =>
            setBoardBody({ ...boardBody, description: e.target.value })
          }
          placeholder="Board description"
        />
        <button type="submit" disabled={isLoading}>
          {isUpdate ? 'Update' : 'Create'}
        </button>
      </form>

      <div>
        {isBoardsLoading ? <p>Loading...</p> : null}
        {boards && boards.length > 0 ? (
          <ul>
            {boards.map((board) => {
              const isOwner =
                currentUser._id && board.ownerId === currentUser._id;
              return (
                <li key={board._id}>
                  <div>
                    <Link to={`/boards/${board._id}`}>{board.title}</Link>
                    {isOwner && (
                      <button onClick={() => handleUpdate(board)}>Edit</button>
                    )}
                    {isOwner && (
                      <button
                        disabled={isDeleting}
                        onClick={() => deleteBoard(board._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPage;
