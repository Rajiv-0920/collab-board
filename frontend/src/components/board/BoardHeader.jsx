import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AvatarStack, RoleBadge } from './BoardParts';
import { cn } from '@/lib/utils';
import { useGetBoardDetailsQuery } from '@/services/boardsApi';

/**
 * Responsive board header.
 *
 * - Below `md` the layout stacks: title row first, actions row second.
 * - Below `sm` secondary actions (Add list, Activity) move into the "..." menu
 *   so the action row never wraps into a messy second line on phones.
 * - From `sm` up, Add list and Activity are regular buttons with labels.
 */
const BoardHeader = ({
  members = [],
  isOwner = false,
  myRole,
  canEdit = false,
  backTo = '/dashboard',
  onOpenMembers,
  onOpenActivity,
  onEdit,
  onDelete,
  onAddList,
}) => {
  const params = useParams();
  const boardId = params.boardId ?? params.id;
  const { data: board, isLoading } = useGetBoardDetailsQuery(boardId, {
    skip: !boardId,
  });

  const users = members.map((member) => member?.userId).filter(Boolean);
  const memberCount = users.length;

  // The menu always has Activity on small screens; on larger screens it only
  // exists for the owner (Edit / Delete).
  const showMenu = true;

  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b pb-3',
        'sm:gap-4 sm:pb-4',
        'md:flex-row md:items-center md:justify-between md:pb-5',
      )}
    >
      {/* Title block */}
      <div className="flex min-w-0 items-start gap-2 sm:gap-3">
        <Link
          to={backTo}
          aria-label="Back to boards"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'mt-0.5 size-8 shrink-0 rounded-xl text-muted-foreground hover:text-foreground sm:size-9',
          )}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {isLoading && !board ? (
              <span
                className="h-7 w-44 animate-pulse rounded-md bg-muted sm:h-8 sm:w-56"
                aria-hidden="true"
              />
            ) : (
              <h1
                className="line-clamp-2 min-w-0 break-words text-lg font-semibold leading-tight tracking-tight sm:text-xl md:text-2xl"
                title={board?.title}
              >
                {board?.title || 'Untitled board'}
              </h1>
            )}

            {myRole && <RoleBadge role={myRole} />}

            {myRole === 'viewer' && (
              <span className="rounded-full border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                View only
              </span>
            )}
          </div>

          {board?.description && (
            <p
              className="mt-1 line-clamp-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:line-clamp-2 sm:text-sm"
              title={board.description}
            >
              {board.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:shrink-0 md:justify-end">
        <button
          type="button"
          onClick={onOpenMembers}
          aria-label={`View ${memberCount} board ${memberCount === 1 ? 'member' : 'members'}`}
          className={cn(
            'mr-auto flex h-9 items-center rounded-xl border border-transparent px-1.5 md:mr-0',
            'transition-colors hover:border-border hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span className="sm:hidden">
            <AvatarStack users={users} max={3} />
          </span>
          <span className="hidden sm:block">
            <AvatarStack users={users} max={5} />
          </span>
          <span className="ml-2 text-xs font-medium tabular-nums text-muted-foreground">
            {memberCount}
          </span>
        </button>

        {isOwner && (
          <Button
            type="button"
            size="sm"
            onClick={onOpenMembers}
            className="h-9 rounded-xl"
          >
            <UserPlus className="mr-2 size-4" aria-hidden="true" />
            Invite
          </Button>
        )}

        {canEdit && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddList}
            className="hidden h-9 rounded-xl sm:inline-flex"
          >
            <Plus className="mr-2 size-4" aria-hidden="true" />
            <span className="hidden lg:inline">Add list</span>
            <span className="lg:hidden">List</span>
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onOpenActivity}
          className="hidden h-9 rounded-xl sm:inline-flex"
          aria-label="Open activity"
        >
          <History className="mr-2 size-4" aria-hidden="true" />
          <span className="hidden lg:inline">Activity</span>
          <span className="lg:hidden">Log</span>
        </Button>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  // Without owner-only items there is nothing to show from sm up.
                  className={cn(
                    'size-9 shrink-0 rounded-xl',
                    !isOwner && 'sm:hidden',
                  )}
                  aria-label="Board actions"
                />
              }
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {canEdit && (
                <DropdownMenuItem onClick={onAddList} className="sm:hidden">
                  <Plus className="mr-2 size-4" aria-hidden="true" />
                  Add list
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={onOpenActivity} className="sm:hidden">
                <History className="mr-2 size-4" aria-hidden="true" />
                Activity
              </DropdownMenuItem>

              {isOwner && (
                <>
                  <DropdownMenuSeparator className="sm:hidden" />

                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 size-4" aria-hidden="true" />
                    Edit board
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" aria-hidden="true" />
                    Delete board
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default BoardHeader;
