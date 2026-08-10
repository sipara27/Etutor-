"use client";
import { RefreshToken } from "../types/UserItem";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { removeUser } from "@/state/store/slices/userSlices";
import { IsWindowUndefined } from "./func_utils";
import { message } from "antd";
import useHandleError, { ApiErrorModel } from "./handleError";
export let host: string;

export const commonURL = `${process.env.NEXT_PUBLIC_BASE_URL}/commons/`;
export const appURL = `${process.env.NEXT_PUBLIC_BASE_URL}/applications/`;
export const fileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/media/`;
export const tokenKey = `${appURL}.token.authorizationData`;
export const refreshKey = `${appURL}.refresh.authorizationData`;
export const corsUrl = `${process.env.NEXT_PUBLIC_CORS_URL}/`;
const connectionErrorMessageKey = "api-connection-error";

export const refresh_token = () => {
  const refresh = localStorage.getItem(refreshKey);
  return axios.post<RefreshToken>(`${commonURL}authorize/token/refresh/`, {
    refresh,
  });
};

export const requestConfig = (
  api: AxiosInstance,
  config: InternalAxiosRequestConfig
) => {
  if (config.url?.endsWith("/null")) {
    return config;
  }
  if (getToken()) {
    config.headers!.Authorization = `Bearer ${getToken()}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
  return config;
};

export const getToken = () => {
  return localStorage.getItem(tokenKey);
};

export const handleError = (error: any, form: any) => {
  const errors = error.response.data.error?.details;
  for (const err in errors) {
    if (err === 'non_field_errors') {
      form.setError('root', { message: errors[err] })
    } else {
      form.setError(err, { message: errors[err] })
    }
  }
}

export const useRefreshToken = () => {
  const dispatch = useDispatch();
  let params = useParams<{ id: string }>();
  const exclude = [
    "/",
    `/course_detail/${params?.id}`,
    `/tutors/${params?.id}`,
  ];
  const addRefreshToken = async (
    error: AxiosError,
    cb: Function,
    router?: AppRouterInstance
  ) => {
    const config = error.config;
    try {
      let res = await refresh_token();
      if (res.data.access) {
        localStorage.setItem(tokenKey, res.data.access);
        localStorage.setItem(refreshKey, res.data.refresh);
        config!.headers!.Authorization = `Bearer ${res.data.access}`;
      }
      return cb(config);
    } catch (err) {
      const errors = err as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const status = errors.response?.status;
        if (status === 400 || status === 401) {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(refreshKey);
          dispatch(removeUser());
          if (
            !exclude.includes(
              IsWindowUndefined() ? window?.location.pathname : "",
              0
            )
          ) {
            // logout()
            // router?.push('/login');
          }
        }
      }
      return Promise.reject(err);
    }
  };
  return { addRefreshToken };
};

const useApi = () => {
  const router = useRouter();
  const refreshToken = useRefreshToken();
  const handleError = useHandleError();

  const useAppApi = () => {
    const api = axios.create({
      baseURL: appURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => requestConfig(api, config),
      (error) => Promise.reject(error)
    );
    api.interceptors.response.use(
      (response) => response,
      (error) => handleResponseError(error, api)
    );
    return api;
  };
  const useFileApi = () => {
    const api = axios.create({
      baseURL: fileUrl,
      headers: {
        "content-type": "multipart/form-data",
      },
    });

    api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => requestConfig(api, config),
      (error) => Promise.reject(error)
    );
    api.interceptors.response.use(
      (response) => response,
      (error) => handleResponseError(error, api)
    );
    return api;
  };
  const useCommonApi = () => {
    const api = axios.create({
      baseURL: commonURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    api.interceptors.request.use(
      (config: any) => requestConfig(api, config),
      (error) => Promise.reject(error)
    );
    api.interceptors.response.use(
      (response) => response,
      (error) => handleResponseError(error, api)
    );
    return api;
  };
  const handleResponseError = (
    error: AxiosError<ApiErrorModel>,
    cb: Function
  ) => {
    const status = error.response?.status;
    if (status == undefined) {
      message.error({
        content: "Connection Failed. Please Try again",
        key: connectionErrorMessageKey,
      });
    }
    switch (status) {
      case 400:
        handleError.notifyError(error);
        break;
      case 401:
        return refreshToken.addRefreshToken(error, cb, router);
      case 403:
        message.error(error.response?.data.error.details.detail);
        break;
      case 404:
        message.error("Resource Not found " + error.response?.config.url);
        break;
      case 500:
        message.error("Error Occured, Contact your administrator");
        break;
      case 503:
        message.error(
          "Unable to contact remote server. Make sure your connection is working and try again"
        );
        break;
      default:
        //handle remaining 4xx or 5xx responses
        // toast.warning(error.message);
        break;
    }
    return Promise.reject(error);
  };
  const commonApi = useCommonApi();
  const appApi = useAppApi();
  const fileApi = useFileApi();
  return { appApi, commonApi, fileApi };
};

export default useApi;
