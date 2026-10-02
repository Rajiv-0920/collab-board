import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../../services/boardsApi';

const CardForm = ({
  handleSubmit,
  cardBody,
  setCardBody,
  isLoading,
  isUpdate,
}) => {
  const { boardId } = useParams();
  const {
    data: board,
    refetch,
    isLoading: isBoardLoading,
  } = useGetBoardDetailsQuery(boardId);
  const today = new Date().toISOString().split('T')[0];

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
        <input
          type="text"
          name="description"
          onChange={(e) =>
            setCardBody({ ...cardBody, description: e.target.value })
          }
          value={cardBody.description}
          placeholder="Card description"
        />
        <input
          type="date"
          name="dueDate"
          min={today}
          onChange={(e) =>
            setCardBody({ ...cardBody, dueDate: e.target.value })
          }
          value={cardBody.dueDate ?? ''}
          placeholder="Due date"
        />
        <input
          type="text"
          name="labels"
          onChange={(e) =>
            setCardBody({
              ...cardBody,
              labels: e.target.value.split(',').map((l) => l.trim()),
            })
          }
          value={cardBody.labels}
          placeholder="Labels"
        />

        <select
          name="members"
          multiple // 1. Allows multiple selections
          size="2" // Shows 5 items at a time and adds a scrollbar if there are more
          onChange={(e) => {
            // 2. Map selected options to an array of _id values
            const selectedValues = Array.from(
              e.target.selectedOptions,
              (option) => option.value,
            );
            setCardBody({
              ...cardBody,
              assigneeIds: selectedValues,
            });
          }}
          value={cardBody.assigneeIds || []} // 3. Value must be an array
        >
          {board?.members?.map((member) => (
            <option key={member.user._id} value={member.user._id}>
              {member.user.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={isLoading}>
          {isUpdate ? 'Update Card' : 'Add Card'}
        </button>
      </form>
    </>
  );
};

export default CardForm;
