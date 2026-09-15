import { useParams } from 'react-router';
import { useGetBoardByIdQuery } from '../services/boardsApi';

const BoardPage = () => {
  const { boardId } = useParams();

  const { data: board, isLoading: isBoardLoading } =
    useGetBoardByIdQuery(boardId);

  if (isBoardLoading) return <div>Loading...</div>;

  return (
    <div>
      {board && (
        <div>
          <h1>{board.title}</h1>
          <p>{board.description}</p>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
