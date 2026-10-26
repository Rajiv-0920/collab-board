const describeActivity = (payload) => {
  const name = payload?.userId?.name || 'Someone';
  const meta = payload?.meta ?? {};
  const who = <strong className="font-semibold">{name}</strong>;

  switch (payload?.action) {
    // Lists
    case 'list:created':
      return (
        <span>
          {who} created the list “<strong>{meta.listTitle}</strong>”
        </span>
      );
    case 'list:updated':
      return (
        <span>
          {who} renamed the list from “<strong>{meta.oldListTitle}</strong>” to
          “<strong>{meta.newListTitle}</strong>”
        </span>
      );
    case 'list:deleted':
      return (
        <span>
          {who} deleted the list “<strong>{meta.listTitle}</strong>”
        </span>
      );

    // Cards
    case 'card:created':
      return (
        <span>
          {who} created card “<strong>{meta.cardTitle}</strong>” in{' '}
          <strong>{meta.listTitle}</strong>
        </span>
      );
    case 'card:moved':
      return (
        <span>
          {who} moved card “<strong>{meta.cardTitle}</strong>” from{' '}
          <strong>{meta.fromListTitle}</strong> to{' '}
          <strong>{meta.toListTitle}</strong>
        </span>
      );
    case 'card:deleted':
      return (
        <span>
          {who} deleted card “<strong>{meta.cardTitle}</strong>” from{' '}
          <strong>{meta.listTitle}</strong>
        </span>
      );

    // Comments
    case 'comment:created':
      return (
        <span>
          {who} commented on “<strong>{meta.cardTitle}</strong>”:{' '}
          <em>“{meta.commentPreview}”</em>
        </span>
      );
    case 'comment:deleted':
      return (
        <span>
          {who} deleted a comment on “<strong>{meta.cardTitle}</strong>”
        </span>
      );

    // Board
    case 'board:updated':
      return (
        <span>
          {who} updated the board details to “<strong>{meta.newTitle}</strong>”
        </span>
      );
    case 'board:deleted':
      return <span>{who} deleted the board</span>;

    // Members
    case 'board:member:invited':
      return (
        <span>
          {who} invited <strong>{meta.invitedUserName}</strong> as{' '}
          <strong>{meta.role}</strong>
        </span>
      );
    case 'board:member:inviteAccepted':
      return <span>{who} accepted the invitation to join this board</span>;
    case 'board:member:updated':
      return (
        <span>
          {who} changed <strong>{meta.targetUserName}&apos;s</strong> role to{' '}
          <strong>{meta.newRole}</strong>
        </span>
      );
    case 'board:member:deleted':
      return (
        <span>
          {who} removed <strong>{meta.deletedUserName}</strong> from the board
        </span>
      );

    default:
      return null;
  }
};

export default describeActivity;
