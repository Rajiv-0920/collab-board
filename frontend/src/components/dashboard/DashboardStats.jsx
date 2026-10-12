import StatCard from './StatCard';
import { LayoutGrid, FolderKanban, Users } from 'lucide-react';

import { useGetBoardsQuery } from '../../services/boardsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';

const DashboardStats = () => {
  const {
    data: boards = [],
    refetch,
    isLoading: isBoardsLoading,
  } = useGetBoardsQuery();
  const currentUser = useSelector(selectCurrentUser);

  const totalBoards = boards?.length;

  const myBoards = boards?.filter(
    (board) => String(board.ownerId._id) === String(currentUser._id),
  ).length;

  const sharedBoards = totalBoards - myBoards;

  const stats = [
    {
      title: 'Total Boards',
      value: totalBoards,
      description: 'Boards available to you',
      icon: LayoutGrid,
    },
    {
      title: 'My Boards',
      value: myBoards,
      description: 'Boards you own',
      icon: FolderKanban,
    },
    {
      title: 'Shared Boards',
      value: sharedBoards,
      description: 'Boards shared with you',
      icon: Users,
    },
  ];
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </section>
  );
};

export default DashboardStats;
