import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Plus,
  Search,
  Tags,
  UserRound,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const MAX_TITLE = 100;
const MAX_LABELS = 8;
const MAX_LABEL_LENGTH = 24;
const SEARCH_THRESHOLD = 6;

const QUICK_DATES = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next week', days: 7 },
];

// Local yyyy-mm-dd. Do not use toISOString(): it converts to UTC and can
// shift the date by a day in timezones like IST.
const dateFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const getUser = (member) => member?.userId ?? member?.user ?? member;

const getMemberId = (member) => {
  const id = getUser(member)?._id ?? getUser(member)?.id;
  return id == null ? '' : String(id);
};

const getMemberName = (member) =>
  getUser(member)?.name || getUser(member)?.email || 'Board member';

const getMemberEmail = (member) => getUser(member)?.email || '';

const getMemberAvatar = (member) => getUser(member)?.avatarUrl || '';

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

// One row inside the soft properties panel: name on the left, control on the right.
const PropertyRow = ({ icon: Icon, label, htmlFor, children }) => (
  <div className="grid grid-cols-[6.5rem_1fr] items-start gap-3 px-3 py-3">
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 pt-1.5 text-sm text-muted-foreground"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </label>
    <div className="min-w-0 space-y-2">{children}</div>
  </div>
);

// Borderless "write directly on the page" styling for title and description.
const BARE_FIELD =
  'rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent';

// Filled control that sits on the tinted properties panel (no outline).
const SOFT_FIELD =
  'border-0 bg-background shadow-xs focus-visible:ring-2 focus-visible:ring-ring/60';

const AddCardSheet = ({
  open,
  onOpenChange,
  onSubmit,
  members = [],
  membersLoading = false,
  membersError = '',
  isSubmitting = false,
  listTitle = '',
  card = null,
}) => {
  const isEditing = Boolean(card?._id ?? card?.id);

  const getAssigneeIds = (assignees = []) =>
    assignees
      .map((assignee) => {
        if (typeof assignee === 'string') return assignee;
        return (
          assignee?._id ??
          assignee?.id ??
          assignee?.userId?._id ??
          assignee?.userId?.id ??
          ''
        );
      })
      .filter(Boolean)
      .map(String);

  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [dueDate, setDueDate] = useState(
    card?.dueDate ? String(card.dueDate).slice(0, 10) : '',
  );
  const [labels, setLabels] = useState(
    Array.isArray(card?.labels) ? card.labels : [],
  );
  const [labelInput, setLabelInput] = useState('');
  const [assigneeIds, setAssigneeIds] = useState(
    getAssigneeIds(card?.assigneeIds),
  );
  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) return;

    setTitle(card?.title ?? '');
    setDescription(card?.description ?? '');
    setDueDate(card?.dueDate ? String(card.dueDate).slice(0, 10) : '');
    setLabels(Array.isArray(card?.labels) ? card.labels : []);
    setLabelInput('');
    setAssigneeIds(getAssigneeIds(card?.assigneeIds));
    setAssigneesOpen(false);
    setMemberQuery('');
    setErrors({});
    setSubmitError('');
  }, [open, card?._id, card?.id]);

  const memberOptions = useMemo(
    () =>
      members
        .map((member) => ({
          id: getMemberId(member),
          name: getMemberName(member),
          email: getMemberEmail(member),
          avatarUrl: getMemberAvatar(member),
        }))
        .filter((member) => member.id),
    [members],
  );

  const selectedMembers = useMemo(
    () => memberOptions.filter((member) => assigneeIds.includes(member.id)),
    [memberOptions, assigneeIds],
  );

  const showMemberSearch = memberOptions.length > SEARCH_THRESHOLD;

  const visibleMembers = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    if (!query) return memberOptions;
    return memberOptions.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );
  }, [memberOptions, memberQuery]);

  const toggleAssignee = (id) => {
    setAssigneeIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // Turn "design, Urgent" into normalized, de-duplicated, capped labels.
  const commitLabels = (raw) => {
    const incoming = raw
      .split(',')
      .map((label) => label.trim().toLowerCase().slice(0, MAX_LABEL_LENGTH))
      .filter(Boolean);

    if (incoming.length === 0) return labels;

    const merged = [...new Set([...labels, ...incoming])].slice(0, MAX_LABELS);
    setLabels(merged);
    setLabelInput('');
    return merged;
  };

  const removeLabel = (label) => {
    setLabels((current) => current.filter((item) => item !== label));
  };

  const handleLabelKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Enter adds a label here; it must not submit the whole form.
      event.preventDefault();
      commitLabels(labelInput);
    } else if (event.key === 'Backspace' && !labelInput && labels.length > 0) {
      removeLabel(labels[labels.length - 1]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      nextErrors.title = 'Card title is required.';
    } else if (normalizedTitle.length > MAX_TITLE) {
      nextErrors.title = `Title must be ${MAX_TITLE} characters or fewer.`;
    }

    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      nextErrors.dueDate = 'Enter a valid due date.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError('');

    // Include a label that was typed but not yet confirmed with Enter or comma.
    const finalLabels = labelInput.trim() ? commitLabels(labelInput) : labels;

    try {
      const payload = {
        title: normalizedTitle,
        description: description.trim(),
        dueDate: dueDate || '',
        labels: finalLabels,
        // Backend expects an array, including when no assignees are selected.
        assigneeIds,
        ...(card?.version != null ? { version: card.version } : {}),
      };

      if (isEditing) {
        await onSubmit(card, payload);
      } else {
        await onSubmit(payload);
      }

      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error?.data?.message ||
          error?.message ||
          `Could not ${isEditing ? 'update' : 'create'} the card. Please try again.`,
      );
    }
  };

  const handleFormKeyDown = (event) => {
    // Ctrl/Cmd + Enter submits from anywhere, including the textarea.
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const fieldError = (id, message) =>
    message ? (
      <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
        {message}
      </p>
    ) : null;

  const labelsFull = labels.length >= MAX_LABELS;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {/* Header: a quiet one-line eyebrow, no bar, icon or divider */}
        <SheetHeader className="space-y-0 px-6 pb-0 pr-14 pt-6 text-left">
          <SheetTitle className="truncate text-sm font-medium text-muted-foreground">
            {isEditing ? 'Edit card' : 'New card'}
            {listTitle && (
              <>
                {' '}
                in <span className="text-foreground">{listTitle}</span>
              </>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isEditing
              ? 'Update the card details below.'
              : 'Fill in the details below and create the card.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3">
            {/* Title and description are written directly on the page */}
            <label htmlFor="new-card-title" className="sr-only">
              Title
            </label>
            <Input
              id="new-card-title"
              autoFocus
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((current) => ({ ...current, title: undefined }));
              }}
              placeholder="Card title"
              maxLength={MAX_TITLE}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? 'new-card-title-error' : undefined
              }
              disabled={isSubmitting}
              className={cn(
                BARE_FIELD,
                'h-auto py-1 text-2xl font-semibold tracking-tight placeholder:text-muted-foreground/40 md:text-2xl',
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-h-5">
                {fieldError('new-card-title', errors.title)}
              </div>
              <span
                className={cn(
                  'shrink-0 text-xs tabular-nums text-muted-foreground/70',
                  title.length >= MAX_TITLE - 10 && 'text-amber-600',
                )}
              >
                {title.length}/{MAX_TITLE}
              </span>
            </div>

            <label htmlFor="new-card-description" className="sr-only">
              Description
            </label>
            <Textarea
              id="new-card-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a description…"
              rows={4}
              disabled={isSubmitting}
              className={cn(
                BARE_FIELD,
                'mt-2 min-h-28 resize-none py-1 text-sm leading-6 placeholder:text-muted-foreground/50',
              )}
            />

            {/* Properties: one soft tinted panel, separated by space not lines */}
            <div className="mt-5 rounded-2xl bg-muted/40 p-1.5">
              <PropertyRow
                icon={CalendarDays}
                label="Due date"
                htmlFor="new-card-due-date"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Input
                    id="new-card-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(event) => {
                      setDueDate(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        dueDate: undefined,
                      }));
                    }}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.dueDate)}
                    aria-describedby={
                      errors.dueDate ? 'new-card-due-date-error' : undefined
                    }
                    className={cn(
                      SOFT_FIELD,
                      'h-8 w-40 text-sm',
                      errors.dueDate && 'ring-2 ring-destructive',
                    )}
                  />
                  {QUICK_DATES.map(({ label, days }) => {
                    const value = dateFromNow(days);
                    const active = dueDate === value;
                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={isSubmitting}
                        aria-pressed={active}
                        onClick={() => {
                          setDueDate(active ? '' : value);
                          setErrors((current) => ({
                            ...current,
                            dueDate: undefined,
                          }));
                        }}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'bg-primary/15 text-primary'
                            : 'bg-background/70 text-muted-foreground hover:bg-background hover:text-foreground',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                  {dueDate && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setDueDate('')}
                      className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {fieldError('new-card-due-date', errors.dueDate)}
              </PropertyRow>

              <PropertyRow icon={Tags} label="Labels" htmlFor="new-card-labels">
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-1.5 rounded-lg bg-background px-2 py-1.5 shadow-xs',
                    'focus-within:ring-2 focus-within:ring-ring/60',
                    isSubmitting && 'opacity-60',
                  )}
                >
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs font-medium"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        disabled={isSubmitting}
                        className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                        aria-label={`Remove label ${label}`}
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="new-card-labels"
                    value={labelInput}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value.includes(',')) commitLabels(value);
                      else setLabelInput(value);
                    }}
                    onKeyDown={handleLabelKeyDown}
                    onBlur={() => commitLabels(labelInput)}
                    placeholder={
                      labels.length === 0 ? 'design, urgent, research' : ''
                    }
                    maxLength={MAX_LABEL_LENGTH}
                    disabled={isSubmitting || labelsFull}
                    className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {labelsFull
                    ? `Maximum of ${MAX_LABELS} labels reached.`
                    : 'Press Enter or comma to add a label.'}
                </p>
              </PropertyRow>

              <PropertyRow icon={UserRound} label="Assignees">
                {membersLoading ? (
                  <p className="pt-1.5 text-sm text-muted-foreground">
                    Loading board members…
                  </p>
                ) : membersError ? (
                  <p className="pt-1.5 text-sm text-destructive" role="alert">
                    {membersError}
                  </p>
                ) : memberOptions.length === 0 ? (
                  <p className="pt-1.5 text-sm text-muted-foreground">
                    No board members found.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {selectedMembers.map((member) => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-background py-0.5 pl-0.5 pr-1.5 text-xs font-medium shadow-xs"
                        >
                          <Avatar className="size-5">
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback className="text-[9px]">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-28 truncate">
                            {member.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAssignee(member.id)}
                            disabled={isSubmitting}
                            className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Remove ${member.name}`}
                          >
                            <X className="size-3" aria-hidden="true" />
                          </button>
                        </span>
                      ))}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        aria-expanded={assigneesOpen}
                        onClick={() => setAssigneesOpen((value) => !value)}
                        className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                      >
                        {assigneesOpen ? (
                          'Done'
                        ) : (
                          <>
                            <Plus className="size-3.5" aria-hidden="true" />
                            {selectedMembers.length > 0
                              ? 'Add more'
                              : 'Add people'}
                          </>
                        )}
                      </Button>
                    </div>

                    {assigneesOpen && (
                      <div className="animate-in fade-in-0 slide-in-from-top-1 rounded-xl bg-background shadow-xs duration-150">
                        {showMemberSearch && (
                          <div className="relative p-2 pb-0">
                            <Search
                              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-[calc(50%-4px)] text-muted-foreground"
                              aria-hidden="true"
                            />
                            <Input
                              value={memberQuery}
                              onChange={(event) =>
                                setMemberQuery(event.target.value)
                              }
                              onKeyDown={(event) => {
                                // Don't submit the form while searching.
                                if (event.key === 'Enter')
                                  event.preventDefault();
                              }}
                              placeholder="Search members"
                              aria-label="Search members"
                              className="h-8 border-0 bg-muted/60 pl-8 text-sm shadow-none"
                              disabled={isSubmitting}
                            />
                          </div>
                        )}

                        <div className="max-h-56 space-y-0.5 overflow-y-auto p-1.5">
                          {visibleMembers.length === 0 ? (
                            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                              No members match “{memberQuery.trim()}”.
                            </p>
                          ) : (
                            visibleMembers.map((member) => {
                              const selected = assigneeIds.includes(member.id);
                              return (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => toggleAssignee(member.id)}
                                  disabled={isSubmitting}
                                  aria-pressed={selected}
                                  className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    selected
                                      ? 'bg-primary/10 text-foreground'
                                      : 'hover:bg-muted',
                                  )}
                                >
                                  <Avatar className="size-7 shrink-0">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate">
                                      {member.name}
                                    </span>
                                    {member.email &&
                                      member.email !== member.name && (
                                        <span className="block truncate text-xs text-muted-foreground">
                                          {member.email}
                                        </span>
                                      )}
                                  </span>
                                  {selected && (
                                    <Check
                                      className="size-4 shrink-0 text-primary"
                                      aria-hidden="true"
                                    />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </PropertyRow>
            </div>

            {submitError && (
              <p
                className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {submitError}
              </p>
            )}
          </div>

          {/* Footer: a tinted bar instead of a divider line */}
          <SheetFooter className="items-center bg-muted/40 px-6 py-4 sm:flex-row sm:justify-between">
            <span className="hidden text-xs text-muted-foreground sm:block">
              <kbd className="rounded bg-background px-1.5 py-0.5 font-sans shadow-xs">
                Ctrl
              </kbd>
              {' / '}
              <kbd className="rounded bg-background px-1.5 py-0.5 font-sans shadow-xs">
                ⌘
              </kbd>{' '}
              +{' '}
              <kbd className="rounded bg-background px-1.5 py-0.5 font-sans shadow-xs">
                Enter
              </kbd>{' '}
              to {isEditing ? 'save' : 'create'}
            </span>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !title.trim()}>
                {isSubmitting
                  ? isEditing
                    ? 'Saving changes…'
                    : 'Creating card…'
                  : isEditing
                    ? 'Save changes'
                    : 'Create card'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddCardSheet;
