import { useState } from 'react';
import { ChevronDown, Edit, Eye, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { RoleBadge, UserAvatar } from './BoardParts';
import { ROLE_META } from './boardUtils';

const INVITE_ROLES = ['viewer', 'editor'];

/* Everyone on the board. Only the owner can invite, change roles or remove. */
const MembersDialog = ({
  open,
  onOpenChange,
  members,
  isOwner,
  currentUserId,
  onInvite,
  onChangeRole,
  onRemove,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value || isInviting) return;

    setIsInviting(true);
    try {
      await onInvite({ email: value, role });
      setEmail('');
    } catch {
      // caller shows the error toast
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Board members</DialogTitle>
          <DialogDescription>
            {isOwner
              ? 'Invite people and manage what they can do on this board.'
              : 'People who have access to this board.'}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <form onSubmit={handleInvite} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                required
                placeholder="Email address"
                aria-label="Email address to invite"
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button type="submit" disabled={!email.trim() || isInviting}>
                {isInviting ? 'Sending...' : 'Invite'}
              </Button>
            </div>

            <div
              role="group"
              aria-label="Role for the invited person"
              className="flex w-fit items-center gap-0.5 rounded-md border p-0.5"
            >
              {INVITE_ROLES.map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={role === value ? 'secondary' : 'ghost'}
                  aria-pressed={role === value}
                  className="h-7"
                  onClick={() => setRole(value)}
                >
                  {ROLE_META[value].label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Editors can change lists and cards. Viewers can only look.
            </p>
          </form>
        )}

        <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
          {members.map((member) => {
            const user = member.userId;
            const isYou = user._id === currentUserId;
            const canManage = isOwner && member.role !== 'owner';

            return (
              <li
                key={member._id}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <UserAvatar user={user} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user.name}
                    {isYou && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Change role for ${user.name}`}
                        />
                      }
                    >
                      {ROLE_META[member.role]?.label}
                      <ChevronDown
                        className="ml-1.5 size-3.5"
                        aria-hidden="true"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {INVITE_ROLES.map((value) => (
                        <DropdownMenuItem
                          key={value}
                          disabled={member.role === value}
                          onClick={() => onChangeRole(member, value)}
                        >
                          {value === 'viewer' ? (
                            <Eye className="mr-2 size-4" aria-hidden="true" />
                          ) : (
                            <Edit className="mr-2 size-4" aria-hidden="true" />
                          )}
                          {ROLE_META[value].label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={cn(
                          'text-destructive focus:text-destructive',
                        )}
                        onClick={() => onRemove(member)}
                      >
                        <Trash2 className="mr-2 size-4" aria-hidden="true" />
                        Remove from board
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <RoleBadge role={member.role} />
                )}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default MembersDialog;
