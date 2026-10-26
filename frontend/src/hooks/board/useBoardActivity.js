import { useState } from 'react';

import { useGetBoardActivityQuery } from '@/services/boardsApi';

export const useBoardActivity = (boardId) => {
  const [paginationState, setPaginationState] = useState({
    boardId,
    page: 1,
  });

  const page = paginationState.boardId === boardId ? paginationState.page : 1;

  const setPage = (nextPage) => {
    setPaginationState((current) => {
      const currentPage = current.boardId === boardId ? current.page : 1;

      const next =
        typeof nextPage === 'function' ? nextPage(currentPage) : nextPage;

      return { boardId, page: next };
    });
  };

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetBoardActivityQuery({ boardId, page }, { skip: !boardId });

  const activities = response?.activities ?? [];
  const pagination = response?.pagination;

  const hasMore =
    pagination?.hasNextPage ??
    (pagination?.totalPages != null ? page < pagination.totalPages : false);

  return {
    activities,
    page,
    setPage,
    hasMore,
    isLoading,
    isFetching,
    refetch,
  };
};
