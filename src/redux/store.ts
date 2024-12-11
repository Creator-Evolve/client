import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/user";
import { authApi } from "./api/auth";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import { mediaApi } from "./api/media";
import { appApi } from "./api/app";
import { researchApi } from "./api/research";
import { imageApi } from "./api/image";
import { userApi } from "./api/user";

const rootReducer = combineReducers({
  user: userSlice,
  [authApi.reducerPath]: authApi.reducer,
  [mediaApi.reducerPath]: mediaApi.reducer,
  [appApi.reducerPath]: appApi.reducer,
  [researchApi.reducerPath]: researchApi.reducer,
  [imageApi.reducerPath]: imageApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: [
    authApi.reducerPath,
    mediaApi.reducerPath,
    appApi.reducerPath,
    researchApi.reducerPath,
    imageApi.reducerPath,
    userApi.reducerPath,
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
        .concat(thunk)
        .concat(authApi.middleware)
        .concat(mediaApi.middleware)
        .concat(appApi.middleware)
        .concat(researchApi.middleware)
        .concat(imageApi.middleware)
        .concat(userApi.middleware),
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
