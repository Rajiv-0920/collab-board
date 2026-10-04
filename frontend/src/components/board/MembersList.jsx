import React, { useState } from 'react';
import { useParams } from 'react-router';
import {
  useGetBoardDetailsQuery,
  useUpdateMemberMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} from '../../services/boardsApi';

const MembersList = () => {
  const { boardId } = useParams();
  const [member, setMember] = useState({ email: '', role: 'viewer' });
  const {
    data: board,
    isLoading: isBoardLoading,
    error: boardError,
  } = useGetBoardDetailsQuery(boardId);
  const nonOwnerMembers = board?.members?.filter(
    (member) => member.role !== 'owner',
  );

  const [
    addMember,
    { isLoading: isLoadingAddMember, isSuccess: isSuccessAddMember },
  ] = useAddMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [removeMember] = useRemoveMemberMutation();

  const handleRoleChange = (e, memberId) => {
    const { value } = e.target;
    updateMember({ boardId, memberId, role: value });
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    addMember({ boardId, email: member.email, role: member.role });
    setMember({ email: '', role: 'viewer' });
  };

  return (
    <div>
      {board.members.length > 0 && <h2>Members</h2>}
      <h3>Add Member</h3>
      <form onSubmit={handleAddMember}>
        <input
          type="text"
          placeholder="Member email"
          value={member.email}
          onChange={(e) => setMember({ ...member, email: e.target.value })}
        />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <select
          onChange={(e) => setMember({ ...member, role: e.target.value })}
          value={member.role}
        >
          <option value="editor">editor</option>
          <option value="viewer">viewer</option>
        </select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <button type="submit">Add</button>
      </form>
      {isSuccessAddMember && <p>Member invited successfully!</p>}
      <ul>
        {nonOwnerMembers &&
          nonOwnerMembers.map((member) => (
            <li key={member.userId._id}>
              Name: {member.userId.name} - Role: {member.role}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(e, member.userId._id)}
              >
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <button
                onClick={() =>
                  removeMember({ boardId, memberId: member.userId._id })
                }
              >
                Remove
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MembersList;
