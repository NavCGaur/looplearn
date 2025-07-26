import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const scienceApi = createApi({
  reducerPath: 'scienceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
    tagTypes: ['ScienceQuestion', 'QuestionStats'],

  endpoints: (build) => ({
    getScienceWords: build.query({
      query: (userId) => {
        console.log("Calling API with userId:", userId);
        return `/science/practice?userId=${userId}`; // Include /api in the path
      },
      //@ts-ignore
      providesTags: ['Words']
    }),
    generateQuestions: build.mutation({
      query: (questionRequest) => ({
        url: '/science/generateQuestions',
        method: 'POST',
        body: questionRequest,
      }),
      //@ts-ignore
      invalidatesTags: ['Words']
    }), 
    saveSelectedQuestions: build.mutation({
      query: (questions) => ({
        url: '/science/save-selected',
        method: 'POST',
        body: questions,
      }),
      //@ts-ignore
      invalidatesTags: ['Words']
    }), 
     getQuestions: build.query({
      query: (userId) => `/science/get-science-questions?userId=${  userId}`,
    }), 
    
    // Get all questions with pagination
    getAllQuestions: build.query<
      any, // Replace 'any' with your actual response type
      { page?: number; limit?: number; sortBy?: string; sortOrder?: string } // Explicitly type the argument
    >({
      query: ({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = {}) => ({
        url: '/get-all-questions',
        params: { page, limit, sortBy, sortOrder },
      }),
      providesTags: ['ScienceQuestion'],
      transformResponse: (response) => {
        console.log('Get all questions API response:', response);
        return response;
      },
    }),

    // Get questions by filters
    getQuestionsByFilters: build.query({
      query: (filters = {}) => ({
        url: '/filter-questions',
        params: {
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 10,
        },
      }),
      providesTags: ['ScienceQuestion'],
      transformResponse: (response) => {
        console.log('Get filtered questions API response:', response);
        return response;
      },
    }),

    // Update a question
    updateQuestion: build.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/update-question/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['ScienceQuestion', 'QuestionStats'],
      transformResponse: (response) => {
        console.log('Update question API response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Update question API error:', response);
        const data = response.data as { message?: string } | undefined;
        return {
          message: data?.message || 'Failed to update question',
          status: response.status,
        };
      },
    }),

    // Delete a question (soft delete)
    deleteQuestion: build.mutation({
      query: (id) => ({
        url: `/delete-question/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ScienceQuestion', 'QuestionStats'],
      transformResponse: (response) => {
        console.log('Delete question API response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Delete question API error:', response);
        const data = response.data as { message?: string } | undefined;
        return {
          message: data?.message || 'Failed to delete question',
          status: response.status,
        };
      },
    }),

    // Get question statistics
    getQuestionStats: build.query({
      query: () => '/science-question/stats',
      providesTags: ['QuestionStats'],
      transformResponse: (response) => {
        console.log('Get question stats API response:', response);
        return response;
      },
    }),

    
    submitRatings: build.mutation({
      query: ({ userId, ratings }) => ({
        url: '/science/submitratings', 
        method: 'POST',
        body: { userId, ratings },
      }),
      //@ts-ignore
      invalidatesTags: ['Words']
    }),

    addPoints: build.mutation({
  query: ({ userId, points, reason }) => ({
    url: `/users/addPoints`,
    method: 'POST',
    body: { userId, points, reason },
  }),
}),

    }),
    
});
export const {
  useGetScienceWordsQuery,
  useSubmitRatingsMutation,
  useAddPointsMutation,
  useGenerateQuestionsMutation,
  useSaveSelectedQuestionsMutation
} = scienceApi;
