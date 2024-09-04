import { HTTP_REQUEST } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { IResponse } from "./auth";
import {
  GenerateTextToImage,
  IGeneratedImageResponse,
  IGenerateTextToImageResponse,
  IGetImageByIdResponse,
  IImageEditsResponse,
  ImageEditRequest,
} from "../interfaces/image";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/image`;

export const imageApi = createApi({
  reducerPath: "image",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["LIST", "LIST_IMAGE_EDITS", "GET_IMAGE_BY_ID"],
  endpoints: (builder) => ({
    generateTextToImage: builder.mutation<
      IGenerateTextToImageResponse,
      GenerateTextToImage
    >({
      query: (body: GenerateTextToImage) => ({
        url: "/generate/text-to-image",
        method: HTTP_REQUEST.POST,
        body: body,
      }),
      invalidatesTags: ["LIST"],
    }),
    inpaintImage: builder.mutation<IResponse, ImageEditRequest>({
      query: (body: ImageEditRequest) => ({
        url: `/edit/inpaint/${body.image_id}`,
        method: HTTP_REQUEST.POST,
        body: body.editData,
      }),
      invalidatesTags: ["LIST_IMAGE_EDITS"],
    }),
    saveImageEdit: builder.mutation<IResponse, { id: string; uri: string }>({
      query: ({ id, uri }: { id: string; uri: string }) => ({
        url: `/edit/save/${id}`,
        method: HTTP_REQUEST.POST,
        body: { s3_url: uri },
      }),
      invalidatesTags:["GET_IMAGE_BY_ID"]
    }),
    removeBackground: builder.mutation<
      IResponse,
      { id: string; imageUrl: string }
    >({
      query: ({ id, imageUrl }: { id: string; imageUrl: string }) => ({
        url: `/edit/remove-background/${id}`,
        method: HTTP_REQUEST.POST,
        body: imageUrl,
      }),
      invalidatesTags: ["LIST_IMAGE_EDITS"],
    }),
    getGeneratedImages: builder.query<
      IGeneratedImageResponse,
      { page: number; limit: number }
    >({
      query: ({ limit, page }: { page: number; limit: number }) =>
        `/all?page=${page}&limit=${limit}`,
      providesTags: ["LIST"],
    }),
    getImageById: builder.query<IGetImageByIdResponse, string>({
      query: (id: string) => `/${id}`,
      providesTags: ["GET_IMAGE_BY_ID"],
    }),
    getImageInpaints: builder.query<IImageEditsResponse, string>({
      query: (id: string) => `/edits/${id}`,
      providesTags: ["LIST_IMAGE_EDITS"],
    }),
    deleteImageById: builder.mutation({
      query: (id: string) => ({
        url: `/${id}`,
        method: HTTP_REQUEST.DELETE,
      }),
    }),
  }),
});

export const {
  useGenerateTextToImageMutation,
  useGetGeneratedImagesQuery,
  useDeleteImageByIdMutation,
  useInpaintImageMutation,
  useGetImageByIdQuery,
  useGetImageInpaintsQuery,
  useRemoveBackgroundMutation,
  useSaveImageEditMutation,
} = imageApi;
