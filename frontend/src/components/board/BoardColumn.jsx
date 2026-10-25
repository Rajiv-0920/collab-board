import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import {
  Check,
  GripVertical,
  Inbox,
  MoreHorizontal,
  Pen,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import BoardCard from './BoardCard';
import AddCardSheet from './AddCardSheet';

/**
 * Layout rules that keep drag & drop working:
 *
 * - The column must NOT use backdrop-filter, filter, transform or
 *   overflow-hidden. Those break `position: fixed` while dragging (card shows
 *   far from the cursor) and break `position: sticky` for the header.
 * - The card droppable must NOT be a scroll container. The only scroller is
 *   the board container in Board.jsx, so the library auto-scrolls it both
 *   horizontally and vertically while dragging cards.
 * - The header is `sticky top-0` and therefore needs an opaque background.
 */
const BoardColumn = ({
  list,
  listIndex,
  canEdit = false,
  isOwner = false,
  currentUserId = '',
  members = [],
  isCreatingCard = false,
  onOpenCard,
  onAddCard,
  onRenameList,
  onDeleteList,
  onDeleteCard,
  onMoveCard,
  onAddComment,
  onDeleteComment,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(list.title ?? '');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const cards = list.cards ?? [];
  const cardCount = cards.length;

  const cancelRename = () => {
    setTitle(list.title ?? '');
    setIsRenaming(false);
  };

  const saveTitle = async (event) => {
    event.preventDefault();
    const nextTitle = title.trim();

    if (!nextTitle || nextTitle === list.title || isSavingTitle) {
      cancelRename();
      return;
    }

    setIsSavingTitle(true);
    try {
      await onRenameList(list, nextTitle);
      setIsRenaming(false);
    } catch {
      // Parent handles and displays the error.
    } finally {
      setIsSavingTitle(false);
    }
  };

  const addCard = async (cardData) => {
    await onAddCard(list, cardData);
    setIsAddingCard(false);
  };

  return (
    <>
      <Draggable
        draggableId={String(list._id)}
        index={listIndex}
        isDragDisabled={!canEdit}
      >
        {(provided, snapshot) => (
          <section
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={provided.draggableProps.style}
            aria-label={`List: ${list.title}`}
            className={cn(
              'group/column relative flex w-[min(86vw,20rem)] shrink-0 flex-col',
              // Opaque background, no backdrop-blur, no overflow-hidden.
              'rounded-2xl border border-border/60 bg-muted shadow-sm',
              snapshot.isDragging && 'z-50 shadow-lg',
            )}
          >
            {/* Sticky list header: stays visible while the board scrolls vertically */}
            <header
              className={cn(
                'sticky top-0 z-10 flex items-center gap-1.5',
                'rounded-t-2xl bg-muted px-3 pb-2 pt-3',
              )}
            >
              {isRenaming ? (
                <form
                  onSubmit={saveTitle}
                  className="flex min-w-0 flex-1 items-center gap-1"
                >
                  <Input
                    autoFocus
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') cancelRename();
                    }}
                    className="h-8 min-w-0 bg-background text-sm font-medium"
                    aria-label="List title"
                    maxLength={120}
                    disabled={isSavingTitle}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0 text-emerald-600 hover:text-emerald-600"
                    disabled={!title.trim() || isSavingTitle}
                    aria-label="Save list title"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    onClick={cancelRename}
                    disabled={isSavingTitle}
                    aria-label="Cancel rename"
                  >
                    <X className="size-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <div
                    {...provided.dragHandleProps}
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-1 rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      canEdit && 'cursor-grab active:cursor-grabbing',
                    )}
                  >
                    {canEdit && (
                      <GripVertical
                        className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover/column:text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <h2
                      className={cn(
                        'truncate text-sm font-semibold tracking-tight',
                        !canEdit && 'pl-1',
                      )}
                    >
                      {list.title}
                    </h2>
                  </div>

                  <span
                    className="min-w-6 shrink-0 rounded-full bg-background px-2 py-0.5 text-center text-xs font-medium tabular-nums text-muted-foreground"
                    aria-label={`${cardCount} cards`}
                  >
                    {cardCount}
                  </span>

                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground"
                            aria-label={`Actions for ${list.title}`}
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => {
                            setTitle(list.title ?? '');
                            setIsRenaming(true);
                          }}
                        >
                          <Pen className="mr-2 size-4" />
                          Rename list
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsAddingCard(true)}>
                          <Plus className="mr-2 size-4" />
                          Add card
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteList?.(list)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete list
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </header>

            <Droppable
              droppableId={String(list._id)}
              type="CARD"
              isDropDisabled={!canEdit}
            >
              {(dropProvided, dropSnapshot) => (
                <div
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  className={cn(
                    // No overflow-* here: the board container is the only scroller.
                    'mx-2 min-h-14 min-w-0 flex-1 space-y-2 rounded-xl p-1',
                    dropSnapshot.isDraggingOver &&
                      'bg-primary/10 ring-1 ring-inset ring-primary/30',
                  )}
                >
                  {cards.map((card, index) => (
                    <BoardCard
                      key={String(card._id)}
                      card={card}
                      cardIndex={index}
                      isFirst={index === 0}
                      isLast={index === cardCount - 1}
                      canEdit={canEdit}
                      isOwner={isOwner}
                      currentUserId={currentUserId}
                      onOpen={onOpenCard}
                      onDelete={onDeleteCard}
                      onMove={onMoveCard}
                      onAddComment={onAddComment}
                      onDeleteComment={onDeleteComment}
                    />
                  ))}
                  {dropProvided.placeholder}
                  {cardCount === 0 && !dropSnapshot.isDraggingOver && (
                    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border/80 px-3 py-6 text-muted-foreground">
                      <Inbox className="size-5 opacity-60" aria-hidden="true" />
                      <p className="text-xs">
                        {canEdit
                          ? 'Drop a card here or add one'
                          : 'No cards yet'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>

            {canEdit && (
              <footer className="p-2 pt-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2 rounded-xl text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  onClick={() => setIsAddingCard(true)}
                >
                  <Plus className="size-4" />
                  Add card
                </Button>
              </footer>
            )}
          </section>
        )}
      </Draggable>

      <AddCardSheet
        open={isAddingCard}
        onOpenChange={setIsAddingCard}
        onSubmit={addCard}
        members={members}
        isSubmitting={isCreatingCard}
      />
    </>
  );
};

export default BoardColumn;
