import { useDispatch, useSelector } from "react-redux"
import { Languages } from "@/types/Translation";
import axios, {  AxiosRequestConfig } from "axios";
import { commonURL, host, refreshKey, refresh_token, requestConfig, tokenKey, useRefreshToken,  } from "@/utils/api";
import { User } from "@/types/UserItem";
import { AppState } from "@/state/store/store";
import { getUser } from "@/state/store/slices/userSlices";

const useAuthentication = () => {
    const user = useSelector((state: AppState) => state.user)
    const refreshToken = useRefreshToken()
    const dispatch = useDispatch();

    const isLoggedIn = (): boolean => {
        return user.username !== undefined;
        // return true;
    }

    const api = () => {

        const api = axios.create({
            baseURL: commonURL,
            headers: {
                'Content-Type': 'application/json',
            }
        })
        api.interceptors.request.use((config: any) => requestConfig(api, config), error => Promise.reject(error))

         api.interceptors.response.use((response) => response, (error) => refreshToken.addRefreshToken(error, api))
        return api
    }


    const authUser = () => {
        const response = api().get<User>(
            'authorize/user/'
        );
        return response;
    };

    const requireLogin = () => {
        if (!isLoggedIn()) {
            return authUser().then(({ data: result }) => {
                dispatch(getUser({ ...result, lang: result.lang }));
            });
        }
    }



    return { isLoggedIn, requireLogin, }
}

export default useAuthentication