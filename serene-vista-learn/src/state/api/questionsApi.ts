import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/questions' }),
  tagTypes: ['Assigned'],
  endpoints: (builder) => ({
    listAssigned: builder.query({
      query: ({ subject, classStandard, chapter, page = 1, limit = 20 }) => ({ url: '/assigned', params: { subject, classStandard, chapter, page, limit } }),
      providesTags: (result) => result && result.data && result.data.items ?
        result.data.items.map((i: any) => ({ type: 'Assigned' as const, id: i._id })) :
        [{ type: 'Assigned' as const, id: 'LIST' }]
    }),
    assign: builder.mutation({
      query: (body) => ({ url: '/assign', method: 'POST', body }),
      invalidatesTags: [{ type: 'Assigned', id: 'LIST' }]
    }),
    deassign: builder.mutation({
      query: (body) => ({ url: '/deassign', method: 'POST', body }),
      invalidatesTags: [{ type: 'Assigned', id: 'LIST' }]
    })
  })
});

export const { useListAssignedQuery, useAssignMutation, useDeassignMutation } = questionsApi;
