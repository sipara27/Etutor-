'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { arrayToObject, arrayToObjectOfArray } from "@/utils/array";
import { User } from "@/types/UserItem";

const initialState = {} as User;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
      getUser: (state: User, action: PayloadAction<User>) => {
        action.payload.converted_user_permission = arrayToObjectOfArray(action.payload.user_permission, 'content_type__model')
          state = action.payload;
          return state;
      },
      removeUser:(state:User)=>{
        state = initialState
        return state
      },
      setLanguage: (state: User, action: PayloadAction<any>) => {
        state.lang = action.payload;
        return state;
    },
      setSize: (state: User, action: PayloadAction<boolean>) => {
        state.isMobile = action.payload
        return state;
      }
  },
  extraReducers:(build) => {
  },
});

export default userSlice.reducer;
export const { getUser, setSize,removeUser, setLanguage } = userSlice.actions;