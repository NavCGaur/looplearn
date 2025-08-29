import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const mathApi = createApi({
  reducerPath: 'mathApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  tagTypes: ['MathQuestion'],
  endpoints: (build) => ({
    getAssignedMathQuestions: build.query<any, string>({
      query: (classStandard) => `/math/get-math-questions/${classStandard}`,
    }),
    generateQuestions: build.mutation({
      query: (payload) => ({ url: '/math/generateQuestions', method: 'POST', body: payload }),
    }),
    saveSelectedQuestions: build.mutation({
      query: (payload) => ({ url: '/math/save-selected', method: 'POST', body: payload }),
    }),
    bulkUploadMathQuestions: build.mutation({
      query: (payload) => ({ url: '/math/bulk-upload', method: 'POST', body: payload }),
      invalidatesTags: ['MathQuestion'],
    }),
    getAllQuestions: build.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => ({ url: '/math/get-all-questions', params: { page, limit } }),
      providesTags: ['MathQuestion'],
    }),
    getQuestionsByFilters: build.query({
      query: (filters = {}) => ({ url: '/math/filter-questions', params: { ...filters, page: filters.page || 1, limit: filters.limit || 10 } }),
      providesTags: ['MathQuestion'],
    }),
    assignNewQuestions: build.mutation({
      query: ({ classStandard, questionIds }) => ({ url: `/math/assign-questions/${classStandard}`, method: 'POST', body: { questionIds } }),
      invalidatesTags: ['MathQuestion'],
    }),
    getAssignedQuestions: build.query({
      query: ({ classStandard, ...filters }) => ({ url: `/math/assigned-questions/${classStandard}`, params: filters }),
      providesTags: ['MathQuestion'],
    }),
    unassignQuestions: build.mutation({
      query: ({ classStandard, questionIds }) => ({ url: `/math/unassign-questions/${classStandard}`, method: 'DELETE', body: { questionIds } }),
      invalidatesTags: ['MathQuestion'],
    }),
    getAvailableQuestionsForAssignment: build.query({
      query: ({ classStandard, ...filters }) => ({ url: `/math/available-questions/${classStandard}`, params: filters }),
      providesTags: ['MathQuestion'],
    }),
  }),
});

export const {
  useGetAssignedMathQuestionsQuery,
  useGenerateQuestionsMutation,
  useSaveSelectedQuestionsMutation,
  useBulkUploadMathQuestionsMutation,
  useGetAllQuestionsQuery,
  useGetQuestionsByFiltersQuery,
  useAssignNewQuestionsMutation,
  useGetAssignedQuestionsQuery,
  useUnassignQuestionsMutation,
  useGetAvailableQuestionsForAssignmentQuery,
} = mathApi;
