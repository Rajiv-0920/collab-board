import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { pluralize, timeAgo, getInitials } from './utils';
import { useDeleteBoardMutation } from '../../services/boardsApi';

/* -------------------------------- Helpers --------------------------------- */

const MAX_VISIBLE_MEMBERS = 3;

const BoardCard = ({ board, onEdit, canManage = false, onDeleteBoard }) => {
  // const [deleteBoard, { isLoading: isDeleting }] = useDeleteBoardMutation();

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
    <Card
      className={cn(
        'group relative flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-none transition-colors',
        'hover:border-foreground/25',
        'has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring',
      )}
    >
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-base font-medium tracking-tight">
          <Link
            to={`/boards/${_id}`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${title}`}
                  className="relative z-10 -my-1 -mr-2 size-8 text-muted-foreground data-[popup-open]:opacity-100 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(board)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteBoard(board._id)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Description */}
      <p className="-mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
        {description?.trim() || 'No description'}
      </p>

      {/* Meta */}
      <p className="text-xs tabular-nums text-muted-foreground">
        {pluralize(listCount, 'list')} · {pluralize(taskCount, 'task')}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center"
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
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
          ))}

          {extraMembers > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              +{extraMembers}
            </span>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {timeAgo(updatedAt)}
        </span>
      </div>
    </Card>
  );
};

export default memo(BoardCard);
