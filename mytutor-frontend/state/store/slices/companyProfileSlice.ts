'use client'

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { CompanyProfileType } from "@/components/settings/CompanyService";

const initialState = {} as any;

const companyProfileSlice = createSlice({
  name: 'companyProfile',
  initialState,
  reducers: {
      dispatchCompanyProfile: (state: any, action: PayloadAction<any>) => {
          state = action.payload;  
          return state 
      }
  },
  extraReducers:(build) =>  {
  },
});

export default companyProfileSlice.reducer;
export const { dispatchCompanyProfile } = companyProfileSlice.actions;