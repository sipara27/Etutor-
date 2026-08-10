import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { useUserService } from "./UserService";
import { Languages } from "../../../types/Translation";
import { getUser } from "@/state/store/slices/userSlices";
import { refreshKey, tokenKey } from "../../../utils/api";
import useLoading from "../../customs/loading/LoadingHook";

const NotAuthUserProvider = (props: { children: any }) => {
  const user = useSelector((state: AppState) => state.user);
  const dispatch = useDispatch();
  const userService = useUserService();
  const loading = useLoading()
  const notAuthUser = !(localStorage.getItem(refreshKey)&&localStorage.getItem(tokenKey))

  useEffect(() => {
    if (!user.username) {
      loading.startLoading()
      if(!notAuthUser){
        userService.authUser().then(({ data: result })=>{
          dispatch(getUser({...result, lang: Languages.ENG}));
        });
      }
      
      loading.stopLoading()
  }}, []);

  return (user.username || notAuthUser) && props.children
};

export default NotAuthUserProvider;
