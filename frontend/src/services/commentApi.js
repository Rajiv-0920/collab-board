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
    deleteComment: builder.mutation({
      query: ({ boardId, listId, cardId, commentId }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards/${cardId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsQuery,
  useDeleteCommentMutation,
} = commentApi;
