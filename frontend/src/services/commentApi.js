import { baseApi } from './baseApi';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: ({ text, boardId, listId, cardId }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: ['Comment'],
    }),
    getComments: builder.query({
      query: ({ boardId, listId, cardId }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments`,
        method: 'GET',
      }),
      providesTags: ['Comment'],
    }),
  }),
});

export const { useCreateCommentMutation, useGetCommentsQuery } = commentApi;
