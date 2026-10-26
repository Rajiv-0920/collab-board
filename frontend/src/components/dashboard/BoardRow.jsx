import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeAgo } from '@/lib/date';
import { avatarInitials } from '@/lib/avatarInitials';
import { pluralize } from '@/lib/pluralize';

const MAX_VISIBLE_MEMBERS = 3;

/* ------------------------------- Component -------------------------------- */

const BoardRow = ({ board, onEdit, onDelete, canManage = false }) => {
  const { _id, title, description, updatedAt, summary = {} } = board;

  const {
    listCount = 0,
    taskCount = 0,
    memberCount = 0,
    membersPreview = [],
  } = summary;

  const members = useMemo(
    () =>
      membersPreview
        .map((member) => ({
          id: member.userId?._id ?? member._id,
          name: member.userId?.name ?? 'Unknown user',
          avatarUrl: member.userId?.avatarUrl,
        }))
        .filter((member) => member.id)
        .slice(0, MAX_VISIBLE_MEMBERS),
    [membersPreview],
  );

  const extraMembers = Math.max(memberCount - members.length, 0);

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 px-4 py-3 transition-colors',
        'hover:bg-muted/50 has-[a:focus-visible]:bg-muted/50',
      )}
    >
      {/* Title + description (stretched link makes the whole row clickable) */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium">
          <Link
            to={`/boards/${_id}`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>
        <p className="truncate text-sm text-muted-foreground">
          {description?.trim() || 'No description'}
        </p>
      </div>

      {/* Counts */}
      <p className="hidden shrink-0 text-xs tabular-nums text-muted-foreground md:block">
        {pluralize(listCount, 'list')} · {pluralize(taskCount, 'task')}
      </p>

      {/* Members */}
      <div
        className="relative z-10 hidden shrink-0 items-center sm:flex"
        role="group"
        aria-label={pluralize(memberCount, 'member')}
      >
        {members.map((member, index) => (
          <Avatar
            key={member.id}
            title={member.name}
            className={cn(
              'size-6 border-2 border-card',
              index > 0 && '-ml-1.5',
            )}
          >
            {member.avatarUrl && (
              <AvatarImage src={member.avatarUrl} alt={member.name} />
            )}
            <AvatarFallback className="bg-muted text-[9px] font-medium text-muted-foreground">
              {avatarInitials(member.name) || '?'}
            </AvatarFallback>
          </Avatar>
        ))}

        {extraMembers > 0 && (
          <span className="ml-1.5 text-xs text-muted-foreground">
            +{extraMembers}
          </span>
        )}
      </div>

      {/* Updated */}
      <span className="hidden w-25 shrink-0 text-right text-xs text-muted-foreground lg:block">
        {timeAgo(updatedAt, 'relative')}
      </span>

      {/* Actions */}
      {canManage ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${title}`}
                className="relative z-10 size-8 shrink-0 text-muted-foreground"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(board)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete?.(board)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="size-8 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
};

export default memo(BoardRow);
