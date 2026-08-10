import CustomInput from "../../customs/custom-input/CustomInput";
import CustomButton from "../../customs/custom-button/CustomButton";
import { useEffect, useState } from "react";
import { useUserService } from "./UserService";
import { appURL } from "../../../utils/api";
import { useDispatch } from "react-redux";
import {
  AuthUser,
  UserLogin,
  UserVerificationCode,
} from "../../../types/UserItem";
import CustomInputError from "../../customs/custom-input-error/CustomInputError";
import useTranslation from "../../../utils/translation";
import { getUser } from "@/state/store/slices/userSlices";
import { useGoogleLogin } from "@react-oauth/google";
import { SubmitHandler, useForm } from "react-hook-form";
import useAuthentication from "./authentication";
import CustomShowPassword from "../../customs/custom-input/CustomShowPassword";
import { LocalStorage } from "../../../utils/localstorage";
import useLoading from "../../customs/loading/LoadingHook";
import SmallLoading from "../../customs/loading/SmallLoading";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { generateUniqueKey } from "@/utils/func_utils";
import { message } from "antd";

function UserLoginPage() {
  const loginForm = useForm<UserLogin>();
  const dispatch = useDispatch();
  const navigator = useRouter();
  const userService = useUserService();
  const loading = useLoading();
  const { translate } = useTranslation();
  const authentication = useAuthentication();
  let params = useParams<{ code: string }>();

  const addToken = (value: AuthUser) => {
    localStorage.setItem(
      `${appURL}.token.authorizationData`,
      value.access_token
    );
    localStorage.setItem(
      `${appURL}.refresh.authorizationData`,
      value.refresh_token
    );
    dispatch(getUser({ ...value.user, lang: value.user.lang }));
    loading.stopLoading();

    const localstorage = new LocalStorage();
    const userId = localstorage.getValue("userId")
    const redirect_url = localstorage.getValue([
      "enrolmentpage",
      "tutorinfopage",
      "instructorrequest",
      "tutorrequest",
    ]);
    // localstorage.remove("userId");

    if (redirect_url && userId===value.user.id) {
      
        navigator.push(`${redirect_url}`);
      
    
    } else {
      if (value.user.is_staff) {
        navigator.push("/dashboard/profile");
      } else {
        navigator.push("/");
      }
    }
  };
  useEffect(() => {
    verifyEmailBeforeLogin();
  }, []);

  const verifyEmailBeforeLogin = () => {
    loading.startLoading();

    params?.code &&
      userService
        .emailVerificationCode(params?.code as unknown as UserVerificationCode)
        .then(({ data: value }) => {
          if (value.refresh_token) {
            loading.stopLoading();
            addToken(value);
            //  navigator.push('/login')
          }
          loading.stopLoading();
          message.info("Your email is verified,");
        })
        .catch((error) => {
          const errors = error.response.data.error.details;
          for (const err in errors) {
            if (err === "non_field_errors") {
              message.info("Your email is not verified!");
            } else {
              message.info("Your email is not verified!");
            }
          }
          loading.stopLoading();
        });
  };

  const isUserhasPageOnLocalstorage = () => {
    const isPathNameFound =
      localStorage.getItem("enrolmentpage") ||
      localStorage.getItem("tutorinfopage");
    if (isPathNameFound !== null) {
      return true && isPathNameFound;
    }
  };

  const onSubmit: SubmitHandler<UserLogin> = (data) => {
    loading.startLoading();
    userService
      .login(data)
      .then(({ data: value }) => {
        if (value.refresh_token) {
          addToken(value);
          loading.stopLoading();
        }
      })
      .catch((error) => {
        const errors = error.response.data.error.details;
        for (const err in errors) {
          if (err === "non_field_errors") {
            loginForm.setError("root", { message: errors[err][0] });
          } else {
            loginForm.setError(err as keyof UserLogin, {
              message: errors[err],
            });
          }
        }
        loading.stopLoading();
      });
  };

  // const login =()=>{
  //     setLoadingComponent(<SmallLoading {...loading} />)
  //     googleLogin()
  // }

  // const googleLogin = useGoogleLogin({
  //     onSuccess: tokenResponse => {

  //         userService.google(tokenResponse.access_token).then(({data:value}) => {
  //             addToken(value)
  //         })
  //     },
  //     onError:error=>{

  //     }
  //   });

  //   const onSuccess = (e:any) => {
  //     userService.github(e.code).then(({data:value})=>{
  //         addToken(value)
  //     })
  //   }

  //   const loginTelegram = () =>{
  //     //   userService.telegram().then(({data:value})=>{
  //     //         // addToken(value)
  //     //     })
  //     return <a href="https://t.me/nisir_elearning_bot/elearning_auth">login</a>
  //   }

  const [loadingComponent, setLoadingComponent] = useState<JSX.Element>();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {/* <Loading {...loading} /> */}
      <form onSubmit={loginForm.handleSubmit(onSubmit)}>
        <CustomInputError msg={loginForm.formState.errors.root?.message} />
        <CustomInput
          type="text"
          placeholder="Username"
          {...loginForm}
          label="username"
          options={{ required: "Username is required" }}
          error={loginForm.formState.errors.username}
        />
        <CustomInput
          type={`${isVisible ? "text" : "password"}`}
          placeholder={translate("password")}
          {...loginForm}
          label="password"
          options={{
            required: "Password is required",
          }}
          error={loginForm.formState.errors.password}
        />
        <CustomShowPassword isVisible={isVisible} setIsVisible={setIsVisible} />
        <div className="pr-1 md:mt-2 text-right text-custom_orange-900">
          <Link href="/reset_request">Forget password?</Link>
        </div>
        <div className="md:mt-5">
          <CustomButton
            text={translate("login")}
            type="submit"
            is_loading={<SmallLoading {...loading} />}
          />
          {/* <CustomButton text="Login with Google" form="transparent" fun={login}  is_loading={loadingComponent}/>  */}
          {/* <GitHubLogin
                clientId="07a8752bcbc4ac250cc9"
                redirectUri="http://localhost:3000/login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                className={
                    "relative z-20 overflow-hidden w-full cursor-pointer mt-5 leading-[3.75rem] rounded-xl text-sm sm:text-lg sm:leading-[3.75rem] font-medium transition-all duration-300 ease-in inline-block px-8 whitespace-nowrap " +
                    ("" === "" &&
                      " text-white bg-custom_orange-900 border-custom_orange-900 disabled:cursor-not-allowed disabled:opacity-75 hover:opacity-75 ")
                  }
                buttonText="Login with Github"/>  */}
          {/* <CustomButton text="Login with Telegram" form="transparent" fun={loginTelegram}/>
            <a href="https://t.me/nisir_elearning_bot/elearning_auth">Login with Telegram</a> */}
        </div>
        <div className="flex justify-center p-3">
          <Link href="/student_register" className="block text-lg font-medium ">
            Sign Up
          </Link>
        </div>
        <div className="flex flex-wrap justify-center font-medium gap-1">
       
          <span>Do you want to Sign as a </span>
          <div className="pr-1  text-right text-custom_orange-900">
            <Link href="/register"  className="pr-1  text-right text-custom_orange-900"> Student </Link>
          </div>
          <span>or </span>
          <div className="pr-1 text-right text-custom_orange-900">
            <Link href="/tutor_register" className="pr-1 text-right text-custom_orange-900">
              {" "}
              Tutor<span className="text-black">?</span>{" "}
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}

export default UserLoginPage;
