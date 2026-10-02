import { baseApi } from './baseApi';

export const cardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCard: builder.mutation({
      query: ({ boardId, listId, cardBody }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards`,
        method: 'POST',
        body: cardBody,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards', 'List', 'Card'],
    }),
    updateCard: builder.mutation({
      query: ({ boardId, listId, cardId, cardBody, newListId }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        method: 'PATCH',
        body: {
          title: cardBody.title,
          description: cardBody.description,
          dueDate: cardBody.dueDate,
          labels: cardBody.labels,
          assigneeIds: cardBody.assigneeIds,
          prevOrder: cardBody.prevOrder,
          nextOrder: cardBody.nextOrder,
          ...(newListId && { listId: newListId }),
        },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards', 'List', 'Card'],
    }),
    deleteCard: builder.mutation({
      query: ({ boardId, listId, cardId }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards', 'List', 'Card'],
    }),
  }),
});

export const {
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
} = cardApi;
