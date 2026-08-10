'use client'
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlices";
import loadingReducer from "./slices/loadingSlices";
import companyProfileReducer from "./slices/companyProfileSlice";
import { createWrapper } from "next-redux-wrapper";
import toastReducer from './slices/toasts';

export const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      loading: loadingReducer,
      companyProfile: companyProfileReducer,
      toast: toastReducer
    },
    devTools: true,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);

