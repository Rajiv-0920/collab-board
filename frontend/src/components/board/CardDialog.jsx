import { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { UserAvatar } from './BoardParts';
import { labelStyle, timeAgo, toDateInputValue } from './boardUtils';

const SectionTitle = ({ children }) => (
  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {children}
  </h4>
);

/* The inside of the dialog. Keyed by card id so its state resets per card. */
const CardDetails = ({
  card,
  listTitle,
  members,
  canEdit,
  isOwner,
  currentUserId,
  onSave,
  onDelete,
  onAddComment,
  onDeleteComment,
  onClose,
}) => {
  const initialAssigneeIds = (card.assigneeIds ?? []).map((user) => String(user?._id ?? user ?? ''));

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [dueDate, setDueDate] = useState(toDateInputValue(card.dueDate));
  const [labels, setLabels] = useState(card.labels ?? []);
  const [assigneeIds, setAssigneeIds] = useState(initialAssigneeIds);
  const [labelInput, setLabelInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const comments = card.comments ?? [];

  const isDirty =
    title.trim() !== card.title ||
    description !== (card.description ?? '') ||
    dueDate !== toDateInputValue(card.dueDate) ||
    labels.join('|') !== (card.labels ?? []).join('|') ||
    assigneeIds.join('|') !== initialAssigneeIds.join('|');

  const toggleAssignee = (id) =>
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );

  const addLabel = () => {
    const next = labelInput.trim().toLowerCase();
    if (next && !labels.includes(next)) setLabels((prev) => [...prev, next]);
    setLabelInput('');
  };

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(card, {
        title: title.trim(),
        description,
        dueDate: dueDate || null,
        labels,
        assigneeIds,
        version: card.version, // your API uses this to detect edit conflicts
      });
      onClose();
    } catch {
      // The caller shows the error toast; keep the dialog open.
    } finally {
      setIsSaving(false);
    }
  };

  const handleComment = async () => {
    const text = commentText.trim();
    if (!text || isCommenting) return;
    setIsCommenting(true);
    try {
      await onAddComment(card, text);
      setCommentText('');
    } catch {
      // keep the text
    } finally {
      setIsCommenting(false);
    }
  };

  // Viewers only see who is assigned, editors see everyone to pick from
  const visibleMembers = canEdit
    ? members
    : members.filter((member) => assigneeIds.includes(String(member.userId?._id ?? member.userId ?? '')));

  return (
    <div className="flex max-h-[90vh] flex-col">
      <DialogHeader className="border-b px-6 py-4 pr-12 text-left">
        <p className="text-xs text-muted-foreground">
          in list{' '}
          <span className="font-medium text-foreground">{listTitle}</span>
        </p>
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Card details, assignees, labels and comments
        </DialogDescription>
      </DialogHeader>

      <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-[1fr_220px]">
        {/* Left: title, description, comments */}
        <div className="min-w-0 space-y-6">
          <Input
            value={title}
            disabled={!canEdit}
            aria-label="Card title"
            className="h-auto border-transparent px-0 text-xl font-semibold shadow-none focus-visible:border-input focus-visible:px-3 disabled:opacity-100"
            onChange={(event) => setTitle(event.target.value)}
          />

          <div>
            <SectionTitle>Description</SectionTitle>
            {canEdit ? (
              <Textarea
                rows={5}
                value={description}
                placeholder="Add a more detailed description..."
                onChange={(event) => setDescription(event.target.value)}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {description || 'No description.'}
              </p>
            )}
          </div>

          <div>
            <SectionTitle>Comments ({comments.length})</SectionTitle>

            {canEdit && (
              <div className="mb-4 space-y-2">
                <Textarea
                  rows={2}
                  value={commentText}
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                  disabled={isCommenting}
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!commentText.trim() || isCommenting}
                  onClick={handleComment}
                >
                  Comment
                </Button>
              </div>
            )}

            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((comment) => {
                  // Own comments, or any comment if you are the board owner
                  const canDelete =
                    canEdit &&
                    (comment.userId?._id === currentUserId || isOwner);

                  return (
                    <li key={comment._id} className="flex gap-3">
                      <UserAvatar user={comment.userId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">
                            {comment.userId?.name}
                          </span>
                          <span className="text-muted-foreground">
                            {timeAgo(comment.createdAt)}
                          </span>
                          {canDelete && (
                            <button
                              type="button"
                              className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
                              aria-label="Delete comment"
                              onClick={() => onDeleteComment(card, comment)}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-muted/60 px-3 py-2 text-sm">
                          {comment.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: assignees, due date, labels */}
        <aside className="space-y-5">
          <div>
            <SectionTitle>Assignees</SectionTitle>
            {visibleMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Unassigned</p>
            ) : (
              <ul className="max-h-44 space-y-1 overflow-y-auto">
                {visibleMembers.map(({ userId: user }) => {
                  const active = assigneeIds.includes(String(user._id));
                  return (
                    <li key={user._id}>
                      <button
                        type="button"
                        disabled={!canEdit}
                        aria-pressed={active}
                        onClick={() => toggleAssignee(String(user._id))}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                          canEdit && 'hover:bg-muted',
                          active && 'bg-muted',
                        )}
                      >
                        <UserAvatar user={user} className="size-6" />
                        <span className="flex-1 truncate">{user.name}</span>
                        {active && (
                          <Check
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <SectionTitle>Due date</SectionTitle>
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={dueDate}
                disabled={!canEdit}
                aria-label="Due date"
                className="disabled:opacity-100"
                onChange={(event) => setDueDate(event.target.value)}
              />
              {canEdit && dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Clear due date"
                  onClick={() => setDueDate('')}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <SectionTitle>Labels</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {labels.length === 0 && !canEdit && (
                <p className="text-sm text-muted-foreground">No labels</p>
              )}
              {labels.map((label) => (
                <span
                  key={label}
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                    labelStyle(label),
                  )}
                >
                  {label}
                  {canEdit && (
                    <button
                      type="button"
                      aria-label={`Remove label ${label}`}
                      onClick={() =>
                        setLabels((prev) => prev.filter((l) => l !== label))
                      }
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {canEdit && (
              <Input
                value={labelInput}
                placeholder="Add label + Enter"
                aria-label="Add a label"
                className="mt-2 h-8 text-sm"
                onChange={(event) => setLabelInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    addLabel();
                  }
                }}
              />
            )}
          </div>
        </aside>
      </div>

      {canEdit && (
        <div className="flex items-center justify-between gap-2 border-t px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(card)}
          >
            <Trash2 className="mr-2 size-4" aria-hidden="true" />
            Delete card
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isDirty || !title.trim() || isSaving}
              onClick={handleSave}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const CardDialog = ({ card, open, onOpenChange, ...rest }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
      {card && (
        <CardDetails
          key={card._id}
          card={card}
          onClose={() => onOpenChange(false)}
          {...rest}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default CardDialog;
