import { useState } from 'react';
import {
  useCreateBoardMutation,
  useGetBoardsQuery,
} from '../services/boardsApi';

const DashboardPage = () => {
  const [boardBody, setBoardBody] = useState({ title: '', description: '' });
  const { data: boards, isLoading: isBoardsLoading } = useGetBoardsQuery();
  const [createBoard, { isLoading, isError }] = useCreateBoardMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createBoard(boardBody).unwrap();
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setBoardBody({ title: '', description: '' });
    }
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
        <button type="submit">Create</button>
      </form>

      <div>
        {isBoardsLoading ? <p>Loading...</p> : null}
        {boards && boards.length > 0 ? (
          <ul>
            {boards.map((board) => (
              <li key={board._id}>{board.title}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPage;
