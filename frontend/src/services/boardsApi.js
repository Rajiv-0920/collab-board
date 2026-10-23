import { baseApi } from './baseApi';

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
    getBoardActivity: builder.query({
      query: (boardId) => `/boards/${boardId}/activity`,
      transformResponse: (response) => response.data,
      providesTags: ['Boards'],
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
