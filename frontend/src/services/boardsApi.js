import { baseApi } from './baseApi';

const ACTIVITY_PAGE_SIZE = 10;

const getActivityKey = (item) => item?._id ?? item?.id;

export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: ({
        page = 1,
        limit = 9,
        search,
        type, // 'all' | 'mine' | 'shared'
        role, // 'owner' | 'editor' | 'viewer'
        sort, // 'updated' | 'created' | 'name_asc'
        dateField, // 'created' | 'updated'
        from,
        to,
      } = {}) => {
        // Only send params that actually have a value
        const params = {
          page,
          limit,
          search,
          type,
          role,
          sort,
          dateField,
          from,
          to,
        };

        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            value === 'all'
          ) {
            delete params[key];
          }
        });

        return { url: '/boards', params };
      },
      transformResponse: (response) => response.data,
      providesTags: ['Boards'],
    }),
    getBoardById: builder.query({
      query: (boardId) => `/boards/${boardId}`,
      transformResponse: (response) => response.data,
      providesTags: ['Boards'],
    }),
    getBoardDetails: builder.query({
      query: (boardId) => `/boards/${boardId}/details`,
      transformResponse: (response) => response.data,
      providesTags: ['Boards'],
    }),

    /**
     * Paginated activity feed.
     *
     * Call it with `{ boardId, page }`. All pages of one board share a single
     * cache entry: page 1 replaces the list, later pages are appended
     * (de-duplicated by id). New entries from the socket are prepended with
     *   boardsApi.util.updateQueryData('getBoardActivity', { boardId }, ...)
     *
     * It deliberately has no `providesTags`: invalidating 'Boards' after every
     * mutation would refetch the *current* page and break the merged list.
     * Freshness comes from the socket event and from refetching when the
     * activity sheet is opened.
     *
     * The response is normalised to `{ activities, pagination }`.
     */
    getBoardActivity: builder.query({
      query: ({ boardId, page = 1, limit = ACTIVITY_PAGE_SIZE }) => ({
        url: `/boards/${boardId}/activity`,
        params: { page, limit },
      }),
      transformResponse: (response) => {
        const data = response?.data;
        const activities = Array.isArray(data)
          ? data
          : (data?.activities ?? data?.items ?? []);

        return { activities, pagination: data?.pagination ?? {} };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}(${queryArgs?.boardId})`,
      merge: (currentCache, incoming, { arg }) => {
        if ((arg?.page ?? 1) <= 1) return incoming;

        const seen = new Set(currentCache.activities.map(getActivityKey));
        incoming.activities.forEach((item) => {
          if (!seen.has(getActivityKey(item))) {
            currentCache.activities.push(item);
          }
        });
        currentCache.pagination = incoming.pagination;
        return undefined;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.boardId !== previousArg?.boardId,
    }),

    createBoard: builder.mutation({
      query: (boardData) => ({
        url: '/boards',
        method: 'POST',
        body: boardData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards'],
    }),
    updateBoard: builder.mutation({
      query: ({ id, body }) => ({
        url: `/boards/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards'],
    }),
    deleteBoard: builder.mutation({
      query: (boardId) => ({
        url: `/boards/${boardId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards'],
    }),
    addMember: builder.mutation({
      query: ({ boardId, email, role }) => ({
        url: `/boards/${boardId}/invite`,
        method: 'POST',
        body: { email, role },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards'],
    }),
    updateMember: builder.mutation({
      query: ({ boardId, memberId, role }) => ({
        url: `/boards/${boardId}/members/${memberId}`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards'],
    }),
    removeMember: builder.mutation({
      query: ({ boardId, memberId }) => ({
        url: `/boards/${boardId}/members/${memberId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards'],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardByIdQuery,
  useGetBoardDetailsQuery,
  useGetBoardActivityQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} = boardsApi;
