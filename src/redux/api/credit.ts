import { HTTP_REQUEST } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";

const creditsUrl = `${process.env.NEXT_PUBLIC_API_URL}/credits`;

export interface ICreditPackage {
  _id: string;
  price: number;
  credits: number;
  priceId: string;
  name: string;
  features: string[];
  is_active: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export const creditsApi = createApi({
  reducerPath: "credits",
  baseQuery: fetchBaseQuery({
    baseUrl: creditsUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCreditPackages: builder.query<IResponse<ICreditPackage[]>, void>({
      query: () => ({
        url: "/packages",
        method: HTTP_REQUEST.GET,
      }),
    }),
    buyCreditPackage: builder.mutation<IResponse<string>, string>({
      query: (packageId: string) => ({
        url: `/packages/${packageId}/buy`,
        method: HTTP_REQUEST.POST,
      }),
    }),
  }),
});

export const { useGetCreditPackagesQuery, useBuyCreditPackageMutation } =
  creditsApi;
