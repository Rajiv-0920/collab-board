import { baseApi } from './baseApi';

export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: () => '/boards',
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
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardByIdQuery,
  useGetBoardDetailsQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} = boardsApi;
