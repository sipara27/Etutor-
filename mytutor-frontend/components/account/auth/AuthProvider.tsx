import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { useUserService } from "./UserService";
import { Languages } from "../../../types/Translation";
import { User } from "../../../types/UserItem";
import { getUser } from "@/state/store/slices/userSlices";
import useLoading from "../../customs/loading/LoadingHook";

const AuthProvider = (props: { children: any }) => {
  const user = useSelector((state: AppState) => state.user);
  const dispatch = useDispatch();
  const userService = useUserService();
  const loading = useLoading()

  useEffect(() => {
    if (!user.username) {
      loading.startLoading()
      userService.authUser().then(({ data: result })=>{
        dispatch(getUser({...result, lang: Languages.ENG}));
      });
      loading.stopLoading()
  }}, []);
  return props.children
};

export default AuthProvider;
