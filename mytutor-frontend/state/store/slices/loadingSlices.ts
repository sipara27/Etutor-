'use client'

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState:boolean = false;;

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
      loading: (state: boolean, action: PayloadAction<boolean>) => {
          state = action.payload;
          return state;
      },
  },
  extraReducers:(build) =>  {
  },
});

export default loadingSlice.reducer;
export const { loading } = loadingSlice.actions;