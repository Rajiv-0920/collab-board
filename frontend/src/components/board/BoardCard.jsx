import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { AvatarStack } from './BoardParts';
import { DUE_TONES, getDueStatus, labelStyle } from './boardUtils';
import { timeAgo } from '../dashboard/utils';

/**
 * While dragging, `@hello-pangea/dnd` positions the card with
 * `position: fixed`. Any ancestor with transform / filter / backdrop-filter /
 * contain turns that into "fixed relative to the ancestor", which makes the
 * card appear far from the cursor. Rendering the dragged card in a portal on
 * <body> makes it immune to whatever the surrounding layout does.
 *
 * Set this to false if your dark-mode / theme CSS variables are scoped to a
 * wrapper element instead of <html> or <body>.
 */
const PORTAL_WHILE_DRAGGING = true;

const getId = (value) => String(value?._id ?? value?.id ?? value ?? '');

/**
 * Presentational card. All data changes go through callbacks owned by Board,
 * so the card makes no API calls and subscribes to no queries.
 *
 * The whole top section is the drag handle (click opens the card, drag moves
 * it). The comments panel sits outside the handle so text selection and the
 * comment input never start a drag.
 */
const BoardCard = ({
  card,
  cardIndex,
  isFirst = false,
  isLast = false,
  canEdit = false,
  currentUserId = '',
  isOwner = false,
  onOpen,
  onDelete,
  onMove,
  onAddComment,
  onDeleteComment,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const labels = card.labels ?? [];
  const assignees = card.assigneeIds ?? [];
  const comments = card.comments ?? [];

  const due = getDueStatus(card.dueDate);

  const isOverdue =
    Boolean(card.dueDate) &&
    new Date(card.dueDate).getTime() < Date.now() &&
    new Date(card.dueDate).toDateString() !== new Date().toDateString();

  const hasFooter =
    Boolean(due) || assignees.length > 0 || canEdit || comments.length > 0;

  // Open on click, but ignore clicks on inner controls and on events that
  // bubble up from the dropdown menu (rendered in a portal).
  const handleCardClick = (event) => {
    // Viewers can inspect the card on the board, but must not open the editor sheet.
    if (!canEdit) return;
    if (!event.currentTarget.contains(event.target)) return;
    if (event.target.closest('button, a, input, textarea')) return;
    onOpen?.(card);
  };

  const handleCardKeyDown = (event) => {
    if (!canEdit) return;
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      onOpen?.(card);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    const text = commentText.trim();
    if (!text || isPostingComment || !onAddComment) return;

    setIsPostingComment(true);
    try {
      await onAddComment(card, text);
      setCommentText('');
      setShowComments(true);
    } catch {
      // The parent shows the error and keeps the draft text.
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    try {
      await onDeleteComment?.(card, comment);
    } catch {
      // The parent shows the error.
    }
  };

  return (
    <Draggable
      draggableId={String(card._id)}
      index={cardIndex}
      isDragDisabled={!canEdit}
    >
      {(provided, snapshot) => {
        const content = (
          <article
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={provided.draggableProps.style}
            className={cn(
              'group/card relative rounded-xl border border-border/70',
              'bg-card text-card-foreground shadow-xs',
              // Keep transform/position fully controlled by the dnd library.
              // Transform transitions or scale/rotation make the card lag
              // behind the pointer during a drag.
              'transition-[box-shadow,border-color] duration-150',
              'hover:border-primary/40 hover:shadow-md',
              snapshot.isDragging &&
                'z-50 border-primary/60 shadow-2xl ring-2 ring-primary/20',
            )}
          >
            {/* Drag handle + clickable body */}
            <div
              {...(provided.dragHandleProps ?? { tabIndex: 0, role: 'button' })}
              onClick={handleCardClick}
              onKeyDown={handleCardKeyDown}
              className={cn(
                'relative rounded-xl px-3 pb-3 pt-3 outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring',
                canEdit
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-pointer',
              )}
            >
              {labels.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1 pr-7">
                  {labels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className={cn(
                        'h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide',
                        labelStyle(label),
                      )}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              )}

              <h4
                className={cn(
                  'break-words text-sm font-medium leading-snug',
                  labels.length === 0 && 'pr-7',
                )}
              >
                {card.title}
              </h4>

              {card.description && (
                <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-muted-foreground">
                  {card.description}
                </p>
              )}

              {hasFooter && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {due && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                        DUE_TONES[due.tone],
                        isOverdue && 'font-semibold',
                      )}
                    >
                      <CalendarDays className="size-3" aria-hidden="true" />
                      {due.label}
                    </span>
                  )}

                  {(comments.length > 0 || canEdit) && (
                    <button
                      type="button"
                      onClick={() => setShowComments((value) => !value)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                        'transition-colors hover:bg-muted hover:text-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        showComments || comments.length > 0
                          ? 'text-foreground/80'
                          : 'text-muted-foreground',
                        showComments && 'bg-muted',
                      )}
                      aria-expanded={showComments}
                      aria-label={`${comments.length} comments`}
                    >
                      <MessageSquare className="size-3" aria-hidden="true" />
                      {comments.length}
                    </button>
                  )}

                  {assignees.length > 0 && (
                    <div className="ml-auto pl-1">
                      <AvatarStack users={assignees} max={3} />
                    </div>
                  )}
                </div>
              )}

              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'absolute right-1.5 top-1.5 size-7 text-muted-foreground',
                          'opacity-0 transition-opacity hover:bg-muted hover:text-foreground',
                          'group-hover/card:opacity-100 focus-visible:opacity-100',
                          'data-[state=open]:opacity-100 data-[popup-open]:opacity-100',
                          '[@media(hover:none)]:opacity-100',
                        )}
                        aria-label={`Actions for ${card.title}`}
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onOpen?.(card)}>
                      <Pencil className="mr-2 size-4" />
                      Edit card
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={isFirst}
                      onClick={() => onMove?.(card, 'up')}
                    >
                      <ChevronUp className="mr-2 size-4" />
                      Move up
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={isLast}
                      onClick={() => onMove?.(card, 'down')}
                    >
                      <ChevronDown className="mr-2 size-4" />
                      Move down
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onDelete?.(card)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Comments */}
            {showComments && (
              <div className="rounded-b-xl border-t border-border/70 bg-muted/30 p-3">
                {comments.length > 0 ? (
                  <ul className="max-h-52 space-y-3 overflow-y-auto pr-1">
                    {comments.map((comment) => {
                      const author =
                        typeof comment.userId === 'object'
                          ? comment.userId
                          : null;

                      const canDeleteComment =
                        isOwner || getId(comment.userId) === currentUserId;

                      return (
                        <li
                          key={comment._id}
                          className="group/comment flex items-start gap-2"
                        >
                          <Avatar className="mt-0.5 size-6 shrink-0">
                            <AvatarImage src={author?.avatarUrl} />
                            <AvatarFallback className="text-[9px]">
                              {(author?.name ?? 'U').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="truncate text-xs font-medium">
                                {author?.name ?? 'User'}
                              </span>

                              {comment.createdAt && (
                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                  {timeAgo(comment.createdAt)}
                                </span>
                              )}

                              {canDeleteComment && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comment)}
                                  className={cn(
                                    'ml-auto rounded p-0.5 text-muted-foreground',
                                    'opacity-0 transition-opacity hover:text-destructive',
                                    'group-hover/comment:opacity-100 focus-visible:opacity-100',
                                    '[@media(hover:none)]:opacity-100',
                                  )}
                                  aria-label="Delete comment"
                                >
                                  <Trash2
                                    className="size-3"
                                    aria-hidden="true"
                                  />
                                </button>
                              )}
                            </div>

                            <p className="mt-0.5 break-words rounded-lg rounded-tl-sm border border-border/50 bg-background px-2.5 py-1.5 text-xs leading-5">
                              {comment.text}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-1 text-center text-xs text-muted-foreground">
                    No comments yet.
                  </p>
                )}

                <form
                  onSubmit={handleCommentSubmit}
                  className="mt-3 flex items-center gap-2"
                >
                  <Input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Write a comment..."
                    className="h-8 bg-background text-xs"
                    maxLength={2000}
                    disabled={isPostingComment}
                    aria-label="Write a comment"
                  />

                  <Button
                    type="submit"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={!commentText.trim() || isPostingComment}
                    aria-label="Post comment"
                  >
                    <Send className="size-3.5" />
                  </Button>
                </form>
              </div>
            )}
          </article>
        );

        return PORTAL_WHILE_DRAGGING && snapshot.isDragging
          ? createPortal(content, document.body)
          : content;
      }}
    </Draggable>
  );
};

export default BoardCard;
