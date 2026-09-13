import { baseApi } from './baseApi';

export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: () => '/boards',
      transformResponse: (response) => response.data,
      providesTags: ['Boards'],
    }),
    createBoard: builder.mutation({
      query: (boardData) => ({
        url: '/boards',
        method: 'POST',
        body: boardData,
        transformResponse: (response) => response.data,
      }),
      invalidatesTags: ['Boards'],
    }),
  }),
});

export const { useGetBoardsQuery, useCreateBoardMutation } = boardsApi;
