import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => 'user/me',
      transformResponse: (response) => response.data,
      providesTags: ['User'],
    }),
  }),
});

export const { useGetMeQuery } = userApi;
