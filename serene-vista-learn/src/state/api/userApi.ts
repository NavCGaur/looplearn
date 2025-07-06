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

    assignWordToBulkUsers: builder.mutation({
  query: ({ userIds, wordData }) => ({
    url: '/users/bulk-assign-word',
    method: 'POST',
    body: { userIds, wordData },
    // Optional: Add a signal for manual abort control
    // signal: abortController.signal,
  }),
  invalidatesTags: (result, error, { userIds }) => [
    ...userIds.map(id => ({ type: 'User', id })),
    { type: 'User', id: 'LIST' },
  ],
  // Optional: Transform the response if needed
  transformResponse: (response) => response,
  // Handle side effects (success/error)
  onQueryStarted: async (arg, { dispatch, queryFulfilled, getState }) => {
    // Optional: Optimistic update (if applicable)
    // const patchResult = dispatch(...);

    try {
      const { data } = await queryFulfilled;
      
      // Dispatch success action
      dispatch({
        type: 'user/setBulkAssignResults',
        payload: data.results,
      });

      // Optional: Show a success toast/notification
      // toast.success('Words assigned successfully!');

    } catch (error) {
      // Handle different error cases
      if (error.name === 'AbortError') {
        console.warn('Request was aborted by the user');
      } else {
        console.error('Bulk assignment failed:', error);
        
        // Dispatch error action (if needed)
        dispatch({
          type: 'user/setBulkAssignError',
          payload: error.message || 'Failed to assign words',
        });

        // Optional: Show error toast
        // toast.error('Failed to assign words!');
      }

      // Optional: Revert optimistic update on error
      // if (patchResult) patchResult.undo();
    }
  },
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
  useAssignWordToBulkUsersMutation,
  useRemoveWordFromUserMutation
} = userApi;