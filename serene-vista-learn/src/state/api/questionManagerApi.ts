import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const questionManagerApi = createApi({
  reducerPath: 'questionManagerApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  tagTypes: ['QuestionManager'],
  endpoints: (build) => ({
    getSubjects: build.query<any, void>({
      query: () => '/question-manager/subjects'
    }),
    getClasses: build.query<any, void>({
      query: () => '/question-manager/classes'
    }),
    getChapters: build.query<any, { subject?: string, classStandard?: string }>({
      query: ({ subject, classStandard }) => ({ url: '/question-manager/chapters', params: { subject, classStandard } }),
      // don't cache too long
    }),
    generateUnifiedQuestions: build.mutation<any, any>({
      query: (body) => ({ url: '/question-manager/generate', method: 'POST', body })
    }),
    bulkUploadQuestions: build.mutation<any, { questions: any[] }>({
      query: (body) => ({ url: '/question-manager/bulk-upload', method: 'POST', body })
    })
  })
});

export const {
  useGetSubjectsQuery,
  useGetClassesQuery,
  useGetChaptersQuery,
  useGenerateUnifiedQuestionsMutation,
  useBulkUploadQuestionsMutation
} = questionManagerApi;
