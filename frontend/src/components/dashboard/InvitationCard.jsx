import React from 'react';

const InvitationCard = ({ invitation, onAccept, onDecline }) => {
  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isPending = invitation.status === 'pending' && !isExpired;

  // Inline style objects
  const styles = {
    card: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
      backgroundColor: '#e5e7eb',
      flexShrink: 0,
    },
    infoContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    text: {
      fontSize: '14px',
      color: '#1f2937',
      margin: 0,
    },
    semibold: {
      fontWeight: 600,
    },
    boldDark: {
      fontWeight: 600,
      color: '#111827',
    },
    badge: {
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: '12px',
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      borderRadius: '9999px',
      textTransform: 'capitalize',
    },
    date: {
      fontSize: '12px',
      color: '#9ca3af',
    },
    actions: {
      flexShrink: 0,
      display: 'flex',
      gap: '8px',
    },
    btnAccept: {
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: 500,
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
    btnDecline: {
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: 500,
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#f3f4f6',
      color: '#374151',
    },
    statusLabel: {
      fontSize: '12px',
      fontWeight: 500,
      color: '#6b7280',
      textTransform: 'capitalize',
      padding: '4px 8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.leftSection}>
        {/* Inviter Avatar */}
        <img
          src={invitation.invitedBy.avatarUrl}
          alt={invitation.invitedBy.name}
          style={styles.avatar}
        />

        <div style={styles.infoContainer}>
          <p style={styles.text}>
            <span style={styles.semibold}>{invitation.invitedBy.name}</span>{' '}
            invited you to{' '}
            <span style={styles.boldDark}>{invitation.boardId.title}</span> as a{' '}
            <span style={styles.badge}>{invitation.role}</span>
          </p>
          <span style={styles.date}>
            Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action Buttons or Status */}
      <div style={styles.actions}>
        {isPending ? (
          <>
            <button
              onClick={() => onAccept(invitation._id, invitation.boardId._id)}
              style={styles.btnAccept}
            >
              Accept
            </button>
            <button
              onClick={() => onDecline(invitation._id)}
              style={styles.btnDecline}
            >
              Decline
            </button>
          </>
        ) : (
          <span style={styles.statusLabel}>
            {isExpired ? 'Expired' : invitation.status}
          </span>
        )}
      </div>
    </div>
  );
};

export default InvitationCard;
