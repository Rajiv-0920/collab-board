import { baseApi } from './baseApi';

export const inviteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvites: builder.query({
      query: () => `/invites`,
      providesTags: ['Invites'],
      transformResponse: (response) => response.data,
    }),
    acceptInvite: builder.mutation({
      query: (inviteId) => ({
        url: `/invites/${inviteId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Invites'],
    }),
    declineInvite: builder.mutation({
      query: (inviteId) => ({
        url: `/invites/${inviteId}/decline`,
        method: 'POST',
      }),
      invalidatesTags: ['Invites'],
    }),
  }),
});

export const {
  useGetInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} = inviteApi;
