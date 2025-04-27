import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const vocabApi = createApi({
  reducerPath: 'vocabApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000', // Use the exact base URL without /api
  }),
  endpoints: (build) => ({
    getPracticeWords: build.query({
      query: (userId) => {
        console.log("Calling API with userId:", userId);
        return `/api/vocab/practice?userId=${userId}`; // Include /api in the path
      },
      //@ts-ignore
      providesTags: ['Words']
    }),
    submitRatings: build.mutation({
      query: ({ userId, ratings }) => ({
        url: '/api/vocab/submitratings', // Include /api here too
        method: 'POST',
        body: { userId, ratings },
      }),
      //@ts-ignore
      invalidatesTags: ['Words']
    }),
  }),
});
export const {
  useGetPracticeWordsQuery,
  useSubmitRatingsMutation,
} = vocabApi;
