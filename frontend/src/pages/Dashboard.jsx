// import { useState, useEffect } from 'react';
// import {
//   useCreateBoardMutation,
//   useGetBoardsQuery,
//   useUpdateBoardMutation,
//   useDeleteBoardMutation,
// } from '../services/boardsApi';
// import { Link } from 'react-router';
// import { useSelector } from 'react-redux';
// import { selectCurrentUser } from '../store/authSlice';
// import { socket } from '../services/socket';
// import { useDispatch } from 'react-redux';
// import { boardsApi } from '../services/boardsApi';
// import {
//   useGetInvitesQuery,
//   useAcceptInviteMutation,
//   useDeclineInviteMutation,
// } from '../services/inviteApi';
// import { inviteApi } from '../services/inviteApi';
// import InvitationCard from '../components/dashbaord/InvitationCard';

// const Dashboard = () => {
//   const [boardBody, setBoardBody] = useState({
//     id: '',
//     title: '',
//     description: '',
//   });
//   const dispatch = useDispatch();
//   const {
//     data: boards,
//     refetch,
//     isLoading: isBoardsLoading,
//   } = useGetBoardsQuery();
//   const [createBoard, { isLoading: isCreating, isError }] =
//     useCreateBoardMutation();
//   const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
//   const [deleteBoard, { isLoading: isDeleting }] = useDeleteBoardMutation();
//   const { data: invites, isLoading: isInvitesLoading } = useGetInvitesQuery();
//   const [acceptInvite] = useAcceptInviteMutation();
//   const [declineInvite] = useDeclineInviteMutation();

//   const [isUpdate, setIsUpdate] = useState(false);
//   const isLoading = isCreating || isUpdating;
//   const currentUser = useSelector(selectCurrentUser);

//   useEffect(() => {
//     if (!socket.connected) {
//       socket.connect();
//     }

//     if (boards && boards.length > 0) {
//       boards.forEach((board) => {
//         socket.emit('joinBoard', board._id, (response) => {
//           if (!response.success) {
//             console.log('Error', response.message);
//           }
//         });
//       });
//     }

//     socket.on('board:updated', (updatedBoard) => {
//       dispatch(
//         boardsApi.util.updateQueryData('getBoards', undefined, (draft) => {
//           const boardToUpdate = draft.find((b) => b._id === updatedBoard._id);
//           if (boardToUpdate) {
//             boardToUpdate.title = updatedBoard.title;
//             boardToUpdate.description = updatedBoard.description;
//           }
//         }),
//       );
//     });

//     socket.on('board:deleted', (data) => {
//       dispatch(boardsApi.util.invalidateTags(['Boards']));
//     });

//     socket.on('board:member:invited', (data) => {
//       if (currentUser && data.email === currentUser.email) {
//         dispatch(inviteApi.util.invalidateTags(['Invites']));
//       }
//     });

//     socket.on('board:member:inviteAccepted', (data) => {
//       if (currentUser && data.inviteeId === currentUser._id) {
//         dispatch(boardsApi.util.invalidateTags(['Boards']));
//       }
//     });

//     socket.on('board:member:deleted', (userId) => {
//       if (currentUser && userId === currentUser._id) {
//         dispatch(boardsApi.util.invalidateTags(['Boards']));
//       }
//     });

//     return () => {
//       socket.off('board:updated');
//       socket.off('board:deleted');
//       socket.off('board:member:invited');
//       socket.off('board:member:inviteAccepted');
//       boards?.forEach((board) => {
//         socket.emit('leaveBoard', board._id);
//       });
//       socket.disconnect();
//     };
//   }, [boards, currentUser, dispatch]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isUpdate) {
//         const result = await updateBoard({
//           id: boardBody.id,
//           body: boardBody,
//         }).unwrap();
//         setIsUpdate(false);
//       } else {
//         const result = await createBoard(boardBody).unwrap();
//       }
//     } catch (err) {
//       console.error('Login failed:', err);
//     } finally {
//       setBoardBody({ title: '', description: '' });
//     }
//   };

//   const handleUpdate = async (body) => {
//     setIsUpdate(true);
//     setBoardBody({
//       id: body._id,
//       title: body.title,
//       description: body.description,
//     });
//   };

//   const onAccept = async (inviteId) => {
//     try {
//       await acceptInvite(inviteId);
//       refetch();
//     } catch (err) {
//       console.error('Accept invite failed:', err);
//     }
//   };

//   const onDecline = async (inviteId) => {
//     try {
//       await declineInvite(inviteId);
//     } catch (err) {
//       console.error('Decline invite failed:', err);
//     }
//   };

//   return (
//     <div>
//       <h2>Create Board</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={boardBody.title}
//           onChange={(e) =>
//             setBoardBody({ ...boardBody, title: e.target.value })
//           }
//           placeholder="Board title"
//         />
//         <input
//           type="text"
//           value={boardBody.description}
//           onChange={(e) =>
//             setBoardBody({ ...boardBody, description: e.target.value })
//           }
//           placeholder="Board description"
//         />
//         <button type="submit" disabled={isLoading}>
//           {isUpdate ? 'Update' : 'Create'}
//         </button>
//       </form>

//       <div>
//         {isBoardsLoading ? <p>Loading...</p> : null}
//         {boards && boards.length > 0 ? (
//           <ul>
//             {boards.map((board) => {
//               const isOwner =
//                 currentUser._id && board.ownerId === currentUser._id;
//               return (
//                 <li key={board._id}>
//                   <div>
//                     <Link to={`/boards/${board._id}`}>{board.title}</Link>
//                     {isOwner && (
//                       <button onClick={() => handleUpdate(board)}>Edit</button>
//                     )}
//                     {isOwner && (
//                       <button
//                         disabled={isDeleting}
//                         onClick={() => deleteBoard(board._id)}
//                       >
//                         Delete
//                       </button>
//                     )}
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         ) : null}
//         {invites && invites.length > 0 ? (
//           <ul style={{ listStyleType: 'none', padding: 0 }}>
//             {invites.map((invite) => (
//               <li key={invite._id}>
//                 <InvitationCard
//                   invitation={invite}
//                   onAccept={onAccept}
//                   onDecline={onDecline}
//                 />
//               </li>
//             ))}
//           </ul>
//         ) : null}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
//

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';

import DashboardHeader from '../components/dashboard/DashboardHeader';

import {
  useCreateBoardMutation,
  useGetBoardsQuery,
  useUpdateBoardMutation,
} from '../services/boardsApi';
import { socket } from '../services/socket';
import { boardsApi } from '../services/boardsApi';
import {
  useGetInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} from '../services/inviteApi';
import { inviteApi } from '../services/inviteApi';
import DashboardStats from '@/components/dashboard/DashboardStats';
import BoardGrid from '@/components/dashboard/BoardGrid';
import BoardDialog from '@/components/dashboard/BoardDialog';
import { toast } from '@/components/ui/toast';
import BoardsErrorState from '../components/dashboard/BoardsErrorState';
import BoardsSection from '@/components/dashboard/BoardsSection';
import PendingInvitations from './PendingInvitations';

const Dashboard = () => {
  const [boardDialog, setBoardDialog] = useState({ open: false, board: null });
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading: isBoardsLoading,
    errors: boardsError,
    isFetching: isBoardsFetching,
    isError: isBoardsError,
    refetch,
  } = useGetBoardsQuery({ page, limit: 9 });
  const boards = data?.boards ?? [];
  const pagination = data?.pagination;

  const [createBoard, { isLoading: isBoardCreating, isError }] =
    useCreateBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
  const { data: invites, isLoading: isInvitesLoading } = useGetInvitesQuery();
  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();

  const openCreate = () => setBoardDialog({ open: true, board: null });
  const openEdit = (board) => setBoardDialog({ open: true, board });
  const onOpenChange = (open) => setBoardDialog((prev) => ({ ...prev, open }));

  useEffect(() => {
    const successMessage = sessionStorage.getItem('login_success');
    if (successMessage) {
      sessionStorage.removeItem('login_success');
      toast.add({
        type: 'success',
        description: successMessage,
      });
    }
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (boards && boards.length > 0) {
      boards.forEach((board) => {
        socket.emit('joinBoard', board._id, (response) => {
          if (!response.success) {
            console.log('Error', response.message);
          }
        });
      });
    }

    socket.on('board:updated', (updatedBoard) => {
      dispatch(
        boardsApi.util.updateQueryData('getBoards', undefined, (draft) => {
          const boardToUpdate = draft.find((b) => b._id === updatedBoard._id);
          if (
            currentUser._id.toString() !== boardToUpdate.ownerId._id.toString()
          ) {
            toast.add({
              type: 'info',
              description: `“${boardToUpdate.title}” was updated by ${boardToUpdate.ownerId.name}.`,
            });
          }
          if (boardToUpdate) {
            boardToUpdate.title = updatedBoard.title;
            boardToUpdate.description = updatedBoard.description;
          }
        }),
      );
    });

    socket.on('board:deleted', (data) => {
      dispatch(boardsApi.util.invalidateTags(['Boards']));
    });

    socket.on('board:member:invited', (data) => {
      if (currentUser && data.email === currentUser.email) {
        dispatch(inviteApi.util.invalidateTags(['Invites']));
      }
    });

    socket.on('board:member:inviteAccepted', (data) => {
      if (currentUser && data.inviteeId === currentUser._id) {
        dispatch(boardsApi.util.invalidateTags(['Boards']));
      }
    });

    socket.on('board:member:deleted', (userId) => {
      if (currentUser && userId === currentUser._id) {
        dispatch(boardsApi.util.invalidateTags(['Boards']));
      }
    });

    return () => {
      socket.off('board:updated');
      socket.off('board:deleted');
      socket.off('board:member:invited');
      socket.off('board:member:inviteAccepted');
      boards?.forEach((board) => {
        socket.emit('leaveBoard', board._id);
      });
      socket.disconnect();
    };
  }, [boards, currentUser, dispatch]);

  const onAccept = async (inviteId) => {
    try {
      await acceptInvite(inviteId);
      refetch();
    } catch (err) {
      console.error('Accept invite failed:', err);
    }
  };

  const onDecline = async (inviteId) => {
    try {
      await declineInvite(inviteId);
    } catch (err) {
      console.error('Decline invite failed:', err);
    }
  };

  return (
    <div className="w-full">
      <DashboardHeader name={currentUser?.name} onCreateBoard={openCreate} />

      <BoardDialog
        boardDialog={boardDialog}
        onOpenChange={onOpenChange}
        onCreateBoard={createBoard}
        onUpdateBoard={updateBoard}
        isSaving={isBoardCreating || isUpdating}
      />

      <div className="mt-8 space-y-8">
        <DashboardStats />

        <PendingInvitations
          invites={invites}
          isLoading={isInvitesLoading}
          onAccept={onAccept}
          onDecline={onDecline}
        />

        {isBoardsError ? (
          <BoardsErrorState
            error={boardsError}
            onRetry={refetch}
            isRetrying={isBoardsFetching}
          />
        ) : (
          <BoardsSection
            boards={boards}
            pagination={pagination}
            onPage={setPage}
            isLoading={isBoardsLoading}
            currentUser={currentUser}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
