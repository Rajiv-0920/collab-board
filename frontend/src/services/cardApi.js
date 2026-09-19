import { baseApi } from './baseApi';

export const cardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCard: builder.mutation({
      query: ({ boardId, listId, cardTitle }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards`,
        method: 'POST',
        body: { title: cardTitle },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Boards', 'List', 'Card'],
    }),
    updateCard: builder.mutation({
      query: ({
        boardId,
        listId,
        cardId,
        cardTitle,
        prevOrder,
        nextOrder,
      }) => ({
        url: `/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        method: 'PATCH',
        body: { title: cardTitle, prevOrder, nextOrder },
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
