import StatCard from './StatCard';
import {
  LayoutGrid,
  FolderKanban,
  Users,
  ListTodo,
  CheckSquare,
  UserGroup,
} from 'lucide-react';

import { useGetBoardsQuery } from '../../services/boardsApi';

const DashboardStats = () => {
  const {
    data,
    isLoading: isBoardsLoading,
    errors: boardsError,
    isFetching: isBoardsFetching,
    isError: isBoardsError,
    refetch,
  } = useGetBoardsQuery();
  const boards = data?.boards ?? [];
  const {
    totalBoards = 0,
    myBoards = 0,
    sharedBoards = 0,
    totalLists = 0,
    totalTasks = 0,
    totalMembers = 0,
    totalUniqueMembers = 0,
  } = data?.stats ?? {};

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
    {
      title: 'Total Lists',
      value: totalLists,
      description: 'Lists across all boards',
      icon: ListTodo,
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      description: 'Tasks across all lists',
      icon: CheckSquare,
    },
    {
      title: 'Total Members',
      value: totalUniqueMembers,
      description: 'Unique collaborators across your boards',
      icon: UserGroup,
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
