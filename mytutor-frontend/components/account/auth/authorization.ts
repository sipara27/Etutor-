"use client";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { Permission } from "../../../types/UserItem";
import useAuthentication from "./authentication";
import { useRouter } from "next/navigation";
import { message } from "antd";

const useAuthorization = () => {
  const user = useSelector((state: AppState) => state.user);
  const authentication = useAuthentication();
  const navigator = useRouter();
  ;

  const getUser = () => {
    return user;
  };

  const isSysAdmin = (): boolean => {
    return user.is_superuser;
  };
  const isStaff = (): boolean => {
    return user.is_staff;
  };
  const requireSysAdmin = (): void => {
    if (!isSysAdmin()) {
      navigator.back();
      message.error("You are not system admin");
    }
  };

  const hasPermission = (uri: string, permission: Permission): boolean => {


   
    return (
      user.converted_user_permission &&
      user.converted_user_permission[uri] &&
       user.converted_user_permission[uri].some(val=>val[permission]) 
      // user.converted_user_permission[uri][permission]
    );
  };

  const canCreate = (uri: string): boolean => {
    if (isSysAdmin()) {
      return true;
    }
    return hasPermission(uri, Permission.CAN_CREATE);
  };

  const requireCreate = (uri: string): boolean => {
    if (!canCreate(uri)) {
      navigator.back();
      message.error("You cannot create");
      return false;
    }
    return true;
  };

  const canRead = (uri: string): boolean => {
    if (isSysAdmin()) {
      return true;
    }
    return hasPermission(uri, Permission.CAN_VIEW);
  };

  const requireRead = (uri: string): boolean => {
    if (!canRead(uri)) {
      navigator.back();
      message.error("You cannot read");
      return false;
    }
    return true;
  };

  const canUpdate = (uri: string, group?: string): boolean => {
    if (isSysAdmin()) {
      return true;
    }
    return hasPermission(uri, Permission.CAN_CHANGE);
  };

  const requireUpdate = (uri: string): boolean => {
    if (!canUpdate(uri)) {
      navigator.back();
      message.error("You cannot update");
      return false;
    }
    return true;
  };

  const canDelete = (uri: string): boolean => {
    if (isSysAdmin()) {
      return true;
    }
    return hasPermission(uri, Permission.CAN_DELETE);
  };

  const requireDelete = (uri: string): boolean => {
    if (!canDelete(uri)) {
      navigator.back();
      message.error("You cannot delete");
      return false;
    }
    return true;
  };

  const otherAction = (uri: string): boolean => {
    if (isSysAdmin()) {
      return true;
    }
    
    return hasPermission(uri, Permission.OTHER_ACTION) ;
  };

  const isLoggedIn = authentication.isLoggedIn;
  const requireLogin = authentication.requireLogin;
  return {
    canCreate,
    getUser,
    requireCreate,
    canUpdate,
    requireUpdate,
    canRead,
    requireRead,
    canDelete,
    requireDelete,
    requireSysAdmin,
    otherAction,
    isSysAdmin,
    isStaff,
    isLoggedIn,
    requireLogin,
  };
};

export default useAuthorization;

export function isVisible(visibility: boolean): string {
  return visibility ? "" : "hidden";
}
