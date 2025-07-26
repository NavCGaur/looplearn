import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const vocabApi = createApi({
  reducerPath: 'vocabApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
  }),
  endpoints: (build) => ({
    getPracticeWords: build.query({
      query: (userId) => {
        console.log("Calling API with userId:", userId);
        return `/vocab/practice?userId=${userId}`; // Include /api in the path
      },
      //@ts-ignore
      providesTags: ['Words']
    }),
    
    submitRatings: build.mutation({
      query: ({ userId, ratings }) => ({
        url: '/vocab/submitratings', // Include /api here too
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
  useGetPracticeWordsQuery,
  useSubmitRatingsMutation,
  useAddPointsMutation,
} = vocabApi;
