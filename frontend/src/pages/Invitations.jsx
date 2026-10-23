import { useMemo, useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

import {
  inviteApi,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  useGetInvitesQuery,
} from '../services/inviteApi';

import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';
import { socket } from '@/services/socket';
import InvitationCard from '@/components/invitation/InvitationCard';
import StatCard from '@/components/invitation/StatCard';
import InvitationSkeleton from '@/components/invitation/skeletons/InvitationSkeleton';
import EmptyState from '@/components/invitation/EmptyState';

/* ---------------------------- constants ---------------------------- */
const invitationTabs = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Declined', value: 'declined' },
  { label: 'Expired', value: 'expired' },
];

const Invitations = () => {
  const [processingId, setProcessingId] = useState(null);
  const currentUser = useSelector(selectCurrentUser);
  const { data: invitations = [], isLoading } = useGetInvitesQuery();
  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleInvited = (payload) => {
      if (currentUser && payload.email === currentUser.email) {
        dispatch(inviteApi.util.invalidateTags(['Invites']));
      }
    };

    const handleInviteAccepted = (payload) => {
      if (currentUser && payload.inviteeId === currentUser._id) {
        dispatch(boardsApi.util.invalidateTags(['Boards']));
      }
    };

    socket.on('board:member:invited', handleInvited);
    socket.on('board:member:inviteAccepted', handleInviteAccepted);

    return () => {
      socket.off('board:member:invited', handleInvited);
      socket.off('board:member:inviteAccepted', handleInviteAccepted);
    };
  }, [currentUser, dispatch]);

  const counts = useMemo(() => {
    const result = { pending: 0, accepted: 0, declined: 0, expired: 0 };
    for (const invitation of invitations) {
      if (invitation.status in result) result[invitation.status] += 1;
    }
    return result;
  }, [invitations]);

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invitations.filter((invitation) => {
      const matchesStatus = invitation.status === activeTab;
      const matchesSearch =
        !query ||
        invitation.boardId?.title?.toLowerCase().includes(query) ||
        invitation.invitedBy?.name?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [invitations, activeTab, search]);

  const onAccept = async (inviteId) => {
    try {
      setProcessingId(inviteId);
      await acceptInvite(inviteId);
    } catch (err) {
      console.error('Accept invite failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const onDecline = async (inviteId) => {
    try {
      setProcessingId(inviteId);
      await declineInvite(inviteId);
    } catch (err) {
      console.error('Decline invite failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>
          <p className="text-sm text-muted-foreground">
            Manage your board invitations and collaboration requests.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {counts.pending} pending{' '}
            {counts.pending === 1 ? 'invitation' : 'invitations'}
          </span>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {invitationTabs.map((tab) => (
          <StatCard
            key={tab.value}
            status={tab.value}
            value={counts[tab.value]}
          />
        ))}
      </div>

      {/* Invitations section */}
      <section className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your invitations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review invitations sent to your account.
            </p>
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search boards or people..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div
          role="tablist"
          aria-label="Filter invitations by status"
          className="flex gap-1 overflow-x-auto border-b"
        >
          {invitationTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors',
                  isActive
                    ? 'border-primary font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.5 text-xs tabular-nums',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {counts[tab.value]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <InvitationSkeleton />
        ) : filteredInvitations.length === 0 ? (
          <EmptyState
            activeTab={activeTab}
            search={search}
            onClearSearch={() => setSearch('')}
          />
        ) : (
          <div className="space-y-3">
            {filteredInvitations.map((invitation) => (
              <InvitationCard
                key={invitation._id}
                invitation={invitation}
                isProcessing={processingId === invitation._id}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Invitations;
