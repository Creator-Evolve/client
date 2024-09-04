import { HTTP_REQUEST } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { IResponse } from "./auth";
import { IFileUploadResponse } from "../interfaces/app";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const appApi = createApi({
  reducerPath: "app",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadFile: builder.mutation<IFileUploadResponse, FormData>({
      query: (body: FormData) => ({
        url: "/upload",
        method: HTTP_REQUEST.POST,
        body,
      }),
    }),
    getMedia: builder.mutation<IResponse, string>({
      query: (key: string) => ({
        url: `/media/${encodeURIComponent(key)}`,
        method: HTTP_REQUEST.GET,
      }),
    }),
    getUrlForUpload: builder.mutation<IResponse, string>({
      query: (filename: string) => ({
        url: `/url-for-upload`,
        method: HTTP_REQUEST.POST,
        body: {
          filename,
        },
      }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetMediaMutation,
  useGetUrlForUploadMutation,
} = appApi;
