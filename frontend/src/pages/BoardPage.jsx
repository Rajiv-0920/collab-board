import { useParams } from 'react-router';
import { useGetBoardDetailsQuery } from '../services/boardsApi';
import {
  useCreateListMutation,
  useUpdateListMutation,
} from '../services/listApi';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import BoardList from '../components/board/BoardList';
import ListForm from '../components/board/ListForm';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useEffect } from 'react';
import { useUpdateCardMutation } from '../services/cardApi';
import { socket } from '../services/socket';

const BoardPage = () => {
  const { boardId } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const [listBody, setListBody] = useState({ id: null, title: '' });
  const [errorMsg, setErrorMsg] = useState(null);

  const isUpdating = Boolean(listBody.id);
  const {
    data: board,
    isLoading: isBoardLoading,
    error: boardError,
    refetch,
  } = useGetBoardDetailsQuery(boardId);

  const [createList, { isLoading: isLoadingCreateList }] =
    useCreateListMutation();
  const [updateList] = useUpdateListMutation();
  const [updateCard] = useUpdateCardMutation();

  const [lists, setLists] = useState([]);

  useEffect(() => {
    socket.connect();
    socket.emit('joinBoard', boardId);
    socket.on('card:deleted', () => refetch());
    socket.on('card:updated', () => refetch());
    socket.on('card:created', () => refetch());

    return () => {
      socket.off('card:deleted');
      socket.off('card:created');
      socket.off('card:updated');
      socket.disconnect();
    };
  }, [boardId]);

  useEffect(() => {
    setLists(board?.lists ?? []);
  }, [board?.lists, board?.cards]);

  const isAbleToUpdate = ['owner', 'editor'].includes(board?.myRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (isUpdating) {
        await updateList({
          boardId,
          listId: listBody.id,
          title: listBody.title,
        }).unwrap();
      } else {
        await createList({ boardId, title: listBody.title }).unwrap();
      }
      // Reset form on success
      setListBody({ id: null, title: '' });
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.data?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  const handleUpdateList = (list) => {
    setListBody({
      id: list._id,
      title: list.title,
      prevOrder: list.prevOrder,
      nextOrder: list.nextOrder,
    });
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;

    if (!isAbleToUpdate || !destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === 'LIST') {
      const newLists = Array.from(lists);
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      setLists(newLists);

      const prevList = newLists[destination.index - 1] ?? null;
      const nextList = newLists[destination.index + 1] ?? null;

      try {
        await updateList({
          boardId,
          listId: moved._id,
          title: moved.title,
          prevOrder: prevList ? prevList.order : null,
          nextOrder: nextList ? nextList.order : null,
        }).unwrap();
      } catch (err) {
        setLists(board?.lists ?? []);
        setErrorMsg(err?.data?.message || 'Failed to move list.');
      }
    }

    if (type === 'CARD') {
      const srcIdx = lists.findIndex((l) => l._id === source.droppableId);
      const dstIdx = lists.findIndex((l) => l._id === destination.droppableId);

      // copy lists and cards so RTK state is never mutated
      const newLists = lists.map((l) => ({ ...l, cards: [...l.cards] }));

      const [moved] = newLists[srcIdx].cards.splice(source.index, 1);
      newLists[dstIdx].cards.splice(destination.index, 0, moved);
      setLists(newLists);

      // neighbors in the DESTINATION list, after the move
      const destCards = newLists[dstIdx].cards;
      const prevCard = destCards[destination.index - 1] ?? null;
      const nextCard = destCards[destination.index + 1] ?? null;

      const isCrossList = source.droppableId !== destination.droppableId;

      try {
        await updateCard({
          boardId,
          listId: source.droppableId, // old list (URL)
          cardId: moved._id,
          cardTitle: moved.title,
          prevOrder: prevCard ? prevCard.order : null,
          nextOrder: nextCard ? nextCard.order : null,
          newListId: isCrossList ? destination.droppableId : undefined,
        }).unwrap();
      } catch (err) {
        setLists(board?.lists ?? []);
        setErrorMsg(err?.data?.message || 'Failed to move card.');
      }
    }
  };

  if (isBoardLoading)
    return <div className="loading-spinner">Loading board...</div>;
  if (boardError)
    return <div className="error-banner">Failed to load board details.</div>;

  return (
    <div className="board-page">
      <h1>Welcome, {currentUser?.name || 'User'}</h1>

      {errorMsg && <div className="alert-error">{errorMsg}</div>}

      {isAbleToUpdate && (
        <ListForm
          listBody={listBody}
          setListBody={setListBody}
          handleSubmit={handleSubmit}
          isUpdating={isUpdating}
          isLoadingCreateList={isLoadingCreateList}
          onCancel={
            isUpdating ? () => setListBody({ id: null, title: '' }) : undefined
          }
        />
      )}

      <div className="board-header">
        <h2>{board?.title}</h2>
        <p>{board?.description}</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={boardId} direction="horizontal" type="LIST">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                backgroundColor: snapshot.isDraggingOver
                  ? '#FFE2E2'
                  : '#FBEFEF',
                padding: '20px',
              }}
              className="board-lists-container"
            >
              {lists?.length > 0 ? (
                lists.map((list, index) => (
                  <BoardList
                    key={list._id}
                    list={list}
                    handleUpdateList={handleUpdateList}
                    listIndex={index}
                    updateList={updateList}
                  />
                ))
              ) : (
                <p className="no-lists-text">
                  No lists found. Create one to get started!
                </p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardPage;
