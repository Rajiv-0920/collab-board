import { baseApi } from './baseApi';

export const listApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLists: builder.query({
      query: (boardId) => `/boards/${boardId}/lists`,
      providesTags: ['List'],
      transformResponse: (response) => response.data,
    }),
    createList: builder.mutation({
      query: ({ boardId, title }) => ({
        url: `/boards/${boardId}/lists`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: ['List', 'Boards'],
    }),
    updateList: builder.mutation({
      query: ({ boardId, listId, title }) => ({
        url: `/boards/${boardId}/lists/${listId}`,
        method: 'PATCH',
        body: { title },
      }),
      invalidatesTags: ['List', 'Boards'],
    }),
    deleteList: builder.mutation({
      query: ({ boardId, listId }) => ({
        url: `/boards/${boardId}/lists/${listId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['List', 'Boards'],
    }),
  }),
});

export const {
  useGetListsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
} = listApi;
