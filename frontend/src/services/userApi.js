import { setCredentials } from '../store/authSlice';
import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => 'user/me',
      transformResponse: (response) => response.data,
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          dispatch(setCredentials(result.data));
        } catch (error) {}
      },
    }),
    updateMe: builder.mutation({
      query: (formData) => ({
        url: 'user/profile',
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (formData) => ({
        url: 'user/password',
        method: 'PATCH',
        body: formData,
      }),
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation, useChangePasswordMutation } =
  userApi;
