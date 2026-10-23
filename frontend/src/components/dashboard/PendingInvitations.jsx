import { Link } from 'react-router';
import { LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const expiryLabel = (expiresAt) => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const days = Math.ceil(ms / 86_400_000);
  return `Expires in ${days} day${days === 1 ? '' : 's'}`;
};

// Adjust this mapping if your invite shape differs.
const toView = (invite) => ({
  id: invite._id,
  boardTitle: invite.boardId?.title ?? invite.board?.title ?? 'Untitled board',
  inviter: invite.invitedBy?.name ?? invite.inviterId?.name ?? 'Someone',
  role: invite.role ?? 'member',
  expires: expiryLabel(invite.expiresAt),
});

// Only invites that can still be acted on belong in "Pending".
const isPending = (invite) =>
  invite.status === 'pending' &&
  (!invite.expiresAt || new Date(invite.expiresAt).getTime() > Date.now());

const InviteRow = ({ invite, onAccept, onDecline, disabled }) => {
  const { id, boardTitle, inviter, role, expires } = toView(invite);

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      {/* Info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <LayoutGrid className="size-4" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium">{boardTitle}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>Invited by {inviter}</span>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[11px] font-normal capitalize"
            >
              {role}
            </Badge>
            {expires && (
              <span className="text-muted-foreground/70">{expires}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions: full-width pair on mobile, compact inline on desktop */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onDecline(id)}
          className="sm:min-w-20"
        >
          Decline
        </Button>
        <Button
          size="sm"
          disabled={disabled}
          onClick={() => onAccept(id)}
          className="sm:min-w-20"
        >
          Accept
        </Button>
      </div>
    </div>
  );
};

const InviteRowSkeleton = () => (
  <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Skeleton className="size-9 shrink-0 rounded-md" />
      <div className="w-full space-y-2">
        <Skeleton className="h-4 w-40 max-w-[60%]" />
        <Skeleton className="h-3 w-56 max-w-[80%]" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
      <Skeleton className="h-8 sm:w-20" />
      <Skeleton className="h-8 sm:w-20" />
    </div>
  </div>
);

const PendingInvitationsSkeleton = ({ rows = 2 }) => (
  <Card
    className="gap-0 overflow-hidden py-0 shadow-none"
    aria-busy="true"
    aria-label="Loading invitations"
  >
    <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
      <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
    </div>

    <div className="divide-y border-t">
      {Array.from({ length: rows }).map((_, i) => (
        <InviteRowSkeleton key={i} />
      ))}
    </div>

    <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3 sm:px-5">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-3 w-14" />
    </div>
  </Card>
);

const PendingInvitations = ({
  invites = [],
  isLoading = false,
  onAccept,
  onDecline,
  busyId = null,
  maxVisible = 3,
}) => {
  if (isLoading) return <PendingInvitationsSkeleton />;

  // Accepts either the plain array or the raw { success, data } API response.
  const list = Array.isArray(invites) ? invites : (invites?.data ?? []);
  const pending = list.filter(isPending);

  if (!pending.length) return null;

  const visible = pending.slice(0, maxVisible);

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold tracking-tight">
            Pending Invitations
          </h3>
          <p className="text-xs text-muted-foreground">
            You have been invited to collaborate on these boards.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs font-normal">
          {pending.length} pending
        </Badge>
      </div>

      {/* Rows */}
      <div className="divide-y border-t">
        {visible.map((invite) => (
          <InviteRow
            key={invite._id}
            invite={invite}
            onAccept={onAccept}
            onDecline={onDecline}
            disabled={busyId === invite._id}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
        <span>More invitations and history</span>
        <Link
          to="/invitations"
          className="font-medium text-foreground hover:underline"
        >
          View all →
        </Link>
      </div>
    </Card>
  );
};

export default PendingInvitations;
