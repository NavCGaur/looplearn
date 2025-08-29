import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const mathApi = createApi({
  reducerPath: 'mathApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  tagTypes: ['MathQuestion'],
  endpoints: (build) => ({
    getAssignedMathQuestions: build.query<any, string>({
      query: (classStandard) => `/math/get-math-questions/${classStandard}`,
    }),
  }),
});

export const { useGetAssignedMathQuestionsQuery } = mathApi;
