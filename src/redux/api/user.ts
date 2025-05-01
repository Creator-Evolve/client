import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { IResponse } from "./auth";

const userUrl = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: userUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.user.access_token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserById: builder.query<IResponse, string>({
      query: (id) => `/${id}`,
    }),
  }),
});

export const { useGetUserByIdQuery } = userApi;
