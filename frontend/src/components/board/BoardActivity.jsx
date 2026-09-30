import React from 'react';
import { useGetBoardActivityQuery } from '../../services/boardsApi';
import { useParams } from 'react-router';

const BoardActivity = () => {
  const { boardId } = useParams();
  const { data: activities = [] } = useGetBoardActivityQuery(boardId);
  console.log(activities);
  return (
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Action</th>
          <th>Details</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {activities.map((activity) => {
          const { _id, userId, action, meta, createdAt } = activity;

          return (
            <tr key={_id}>
              <td>{userId?.name || 'Unknown'}</td>
              <td>{action}</td>
              <td>{renderMetaDetails(action, meta)}</td>
              <td>{new Date(createdAt).toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default BoardActivity;

const renderMetaDetails = (action, meta) => {
  console.log(meta);
  if (!meta) return '';

  switch (action) {
    // --- Board Actions ---
    case 'board:updated':
      return `Updated title from "${meta.oldTitle}" to "${meta.newTitle}"`;

    case 'board:member:invited':
      return `Invited ${meta.invitedUserName} as ${meta.role}`;

    case 'board:member:updated':
      return `Changed role for ${meta.targetUserName} from ${meta.oldRole} to ${meta.newRole}`;

    case 'board:member:deleted':
      return `Removed member ${meta.deletedUserName}`;

    // --- Card Actions ---
    case 'card:created':
      return `Card: "${meta.cardTitle}" in list "${meta.listTitle}"`;

    case 'card:moved':
      return `Card: "${meta.cardTitle}" moved from "${meta.fromListTitle}" to "${meta.toListTitle}"`;

    case 'card:deleted':
      return `Card: "${meta.cardTitle}" from list "${meta.listTitle}"`;

    // --- Comment Actions ---
    case 'comment:created':
      return `Comment on "${meta.cardTitle}": "${meta.commentPreview}${meta.commentPreview?.length >= 50 ? '...' : ''}"`;

    case 'comment:deleted':
      return `Deleted comment on "${meta.cardTitle}"`;

    // --- List Actions ---
    case 'list:created':
      return `List: "${meta.listTitle}"`;

    case 'list:updated':
      return `Renamed list from "${meta.oldListTitle}" to "${meta.newListTitle}"`;

    case 'list:deleted':
      return `Deleted list "${meta.listTitle}" (${meta.cardCount} cards removed)`;

    // --- Fallback ---
    default:
      // Fallback if an action isn't explicitly matched
      return Object.values(meta).filter(Boolean).join(' • ');
  }
};
