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
  }),
});

export const { useGetMeQuery } = userApi;
