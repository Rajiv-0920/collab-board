import React from 'react';
import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../../services/boardsApi';

const MembersList = () => {
  const { boardId } = useParams();
  const {
    data: board,
    isLoading: isBoardLoading,
    error: boardError,
  } = useGetBoardDetailsQuery(boardId);

  return (
    <div>
      {board.members.length > 0 && <h2>Members</h2>}
      <h3>Add Member</h3>
      <form>
        <input type="text" placeholder="Member email" />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <select>
          <option value="editor">editor</option>
          <option value="viewer">viewer</option>
        </select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button type="submit">Add</button>
      </form>
      <ul>
        {board.members &&
          board.members.map((member) => (
            <li key={member.id}>
              Name: {member.user.name} - Role: {member.role}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <select value={member.role}>
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <button>Remove</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MembersList;
