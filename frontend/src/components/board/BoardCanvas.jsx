import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { cn } from '@/lib/utils';
import BoardColumn from '@/components/board/BoardColumn';
import AddListForm from '@/components/board/AddListForm';
import BoardEmptyState from '@/components/board/BoardEmptyState';

const BoardCanvas = ({
  boardId,
  lists,
  members,
  canEdit,
  isOwner,
  currentUserId,
  isCreatingCard,
  onDragEnd,
  onOpenCard,
  onAddCard,
  onAddList,
  onRenameList,
  onDeleteList,
  onDeleteCard,
  onMoveCard,
  onAddComment,
  onDeleteComment,
}) => {
  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId={String(boardId)}
          direction="horizontal"
          type="LIST"
          isDropDisabled={!canEdit}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'flex w-max min-w-full items-start gap-3 sm:gap-4',
                'px-3 pb-6 pt-3 sm:pt-4',
                snapshot.isDraggingOver && 'bg-muted/30',
              )}
            >
              {lists.map((list, index) => (
                <BoardColumn
                  key={String(list._id)}
                  list={list}
                  listIndex={index}
                  members={members}
                  canEdit={canEdit}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  isCreatingCard={isCreatingCard}
                  onOpenCard={onOpenCard}
                  onAddCard={onAddCard}
                  onRenameList={onRenameList}
                  onDeleteList={onDeleteList}
                  onDeleteCard={onDeleteCard}
                  onMoveCard={onMoveCard}
                  onAddComment={onAddComment}
                  onDeleteComment={onDeleteComment}
                />
              ))}

              {provided.placeholder}

              {canEdit && <AddListForm onAddList={onAddList} />}

              {!canEdit && lists.length === 0 && <BoardEmptyState />}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardCanvas;
