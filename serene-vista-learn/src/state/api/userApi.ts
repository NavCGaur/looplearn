import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
     }),
  tagTypes: ['User', 'Word'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' }
            ]
          : [{ type: 'User', id: 'LIST' }]
    }),
    
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }]
    }),
    
    assignWordToUser: builder.mutation({
      query: ({ userId, wordData }) => ({
        url: `/users/${userId}/words`,
        method: 'POST',
        body: wordData
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' }
      ]
    }),
    
    removeWordFromUser: builder.mutation({
      query: ({ userId, wordId }) => ({
        url: `/users/${userId}/words/${wordId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' }
      ]
    })
  })
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAssignWordToUserMutation,
  useRemoveWordFromUserMutation
} = userApi;