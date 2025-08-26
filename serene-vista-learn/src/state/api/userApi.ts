import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type QuizType = 'mcq' | 'fillBlank';

interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  word: string;
  definition: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

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

    // Get all users - alias for compatibility
    getAllUsers: builder.query({
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

    // Get users by class standard
    getUsersByClass: builder.query({
      query: (classStandard) => `/users/class/${classStandard}`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' }
            ]
          : [{ type: 'User', id: 'LIST' }]
    }),
    

    getUsersPoints: builder.query({
      query: (userId) => `/users/points/${userId}`,
      providesTags: (result) => 
        result.users
          ? [
              ...result.users.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' }
            ]
          : [{ type: 'User', id: 'LIST' }]
    }),


 assignWordToUser: builder.mutation({
  query: ({ userId, wordData }) => ({
    url: `/users/${userId}/words`,
    method: 'POST',
    body: { ...wordData, subject: wordData.subject || 'English' }
  }),
  invalidatesTags: (result, error, { userId }) => [
    { type: 'User', id: userId },
    { type: 'User', id: 'LIST' }
  ]
}),

// Alias for compatibility
assignWord: builder.mutation({
  query: ({ userId, wordData }) => ({
    url: `/users/${userId}/words`,
    method: 'POST',
    body: { ...wordData, subject: wordData.subject || 'English' }
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

    // Assign words to entire class
    assignWordToClass: builder.mutation({
      query: ({ classStandard, wordData }) => ({
        url: `/users/class/${classStandard}/assign-word`,
        method: 'POST',
        body: wordData
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' }
      ]
    }),

    // Update user's class standard
    updateUserClass: builder.mutation({
      query: ({ userId, classStandard }) => ({
        url: `/users/${userId}/class`,
        method: 'PUT',
        body: { classStandard }
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
    }),

    // Alias for compatibility
    removeWord: builder.mutation({
      query: ({ userId, wordId }) => ({
        url: `/users/${userId}/words/${wordId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' }
      ]
    }),

    
    getQuizQuestions: builder.query<QuizQuestion[], string>({
      query: (uid) => `/users/questions/${uid}`,
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/delete/${id}`,
        method: 'DELETE',
      }),
      //@ts-ignore
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        { type: 'UserWords', id: 'LIST' },
      ],
      transformResponse: (response) => {
        return {
          success: true,
          message: response.message || 'User deleted successfully',
          deletedUserId: response.deletedUserId,
        };
      },
      transformErrorResponse: (response) => {
        return {
          success: false,
                //@ts-ignore
          message: response.data?.message || 'Failed to delete user',
                //@ts-ignore
          error: response.data?.error || 'Unknown error',
        };
      },
    }),
    
    /**
     * Deletes multiple users
     */
    deleteBulkUsers: builder.mutation({
      query: (userIds) => ({
        url: '/users/bulk-delete',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
              //@ts-ignore
        { type: 'UserWords', id: 'LIST' },
      ],
      transformResponse: (response) => {
        // Transform response to match expected format
        //@ts-ignore
        return response.results || response;
      },
      transformErrorResponse: (response) => {
        return {
          success: false,
                //@ts-ignore
          message: response.data?.message || 'Failed to delete users',
                //@ts-ignore
          error: response.data?.error || 'Unknown error',
        };
      },
    }),

    // Alias for compatibility
    deleteUsersByIds: builder.mutation({
      query: (userIds) => ({
        url: '/users/bulk-delete',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
              //@ts-ignore
        { type: 'UserWords', id: 'LIST' },
      ],
      transformResponse: (response) => {
        // Transform response to match expected format
        //@ts-ignore
        return response.results || response;
      },
      transformErrorResponse: (response) => {
        return {
          success: false,
                //@ts-ignore
          message: response.data?.message || 'Failed to delete users',
                //@ts-ignore
          error: response.data?.error || 'Unknown error',
        };
      },
    }),
  })
});

export const {
  useGetUsersQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetUsersByClassQuery,
  useGetUsersPointsQuery,
  useAssignWordToUserMutation,
  useAssignWordMutation,
  useAssignWordToBulkUsersMutation,
  useAssignWordToClassMutation,
  useUpdateUserClassMutation,
  useRemoveWordFromUserMutation,
  useRemoveWordMutation,
  useGetQuizQuestionsQuery,
  useDeleteUserMutation,
  useDeleteBulkUsersMutation,
  useDeleteUsersByIdsMutation,
} = userApi;