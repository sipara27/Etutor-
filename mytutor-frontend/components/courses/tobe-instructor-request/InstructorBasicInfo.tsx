import { useContext, useEffect, useState } from "react";
import { useUserService } from "../../account/auth/UserService";
import { User } from "../../../types/UserItem";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ContentType, GenderOption } from "../../../types/Enums";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { LocalStorage } from "../../../utils/localstorage";
import { validateNotOnlyNumber } from "../../../utils/validation";
import { pwnedPassword } from "hibp";
import { UserIdContext } from "../../account/auth/UserPages";
import { CustomFileUploader } from "../../customs/custom-input/CustomFileUploader/CustomFileUploader";
import { PhoneInput } from "react-international-phone";
import { PhoneNumberUtil } from "google-libphonenumber";
import { FaStarOfLife } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IsWindowUndefined } from "@/utils/func_utils";
import { message } from "antd";
import CustomInput from "../../customs/custom-input/CustomInput";
import CustomButton from "../../customs/custom-button/CustomButton";
import useLoading from "../../customs/loading/LoadingHook";
import SmallLoading from "../../customs/loading/SmallLoading";
import useTranslation from "../../../utils/translation";
import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import useFileService from "../../commons/file/FileService";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import zxcvbn from "zxcvbn";
import CustomShowPassword from "../../customs/custom-input/CustomShowPassword";
import CustomInputError from "../../customs/custom-input-error/CustomInputError";
import "react-international-phone/style.css";
import { Languages } from "@/types/Translation";
import { getUser } from "@/state/store/slices/userSlices";

export interface Props {
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  setKeyValue?: () => void;
  id?: string;
  searchDatas?: () => void;
  cancel?: () => void;
}

const phoneUtil = PhoneNumberUtil.getInstance();

const isPhoneValid = (phone: string) => {
  try {
    if (phone.length < 5) {
      return false;
    }
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

function InstructorBasicInfo(props: Props) {
  let user = useSelector((state: AppState) => state.user);
  const registerForm = useForm<User>();
  const { register, control, formState } = registerForm;
  const { registeredUserId } = useContext(UserIdContext);
  const { translate } = useTranslation();
  const [passStrength, setPassStrength] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const userService = useUserService();
  const fileService = useFileService();
  const loading = useLoading();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    IsWindowUndefined() &&
      window?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    if (user.username) {
      registerForm.reset({ ...user });
    }
  }, [registeredUserId]);

  const onSubmit: SubmitHandler<User> = (data) => {
    loading.startLoading();
    props.setKeyValue && props.setKeyValue();

    let image_name = null;
    if (data?.profile_pic?.length > 0) {
      image_name = (data.profile_pic[0] as File)?.name;
    }

    const formData = new FormData();
    if (data.full_name != "") {
      const names = data?.full_name?.split(" ")!;
      data.first_name = names[0];
      data.middle_name = names[1];
      data.last_name = names[2];
    }
    data.password1 && (data.password2 = data.password1);
    if (image_name) {
      formData.append(
        "url",
        data.profile_pic[0] as Blob,
        (data.profile_pic[0] as File)?.name
      );
      formData.append("file_type", "101");
    }
    if (image_name) {
      fileService.addFile(formData).then(({ data: value }) => {
        data.profile_pic = value.url;
        addEdit(data);
      });
    } else {
      if (JSON.stringify(data.profile_pic) === "{}") {
        data.profile_pic = "";
      }

      loading.startLoading();
      addEdit(data);
    }
  };

  const addEdit = (data: User) => {
    const localstorage = new LocalStorage();

    if (user.username) {
      userService
        .updateUser(data.id, data)
        .then((value) => {
          props.setUserId(value.data.id);
          loading.stopLoading();
          dispatch(getUser({ ...{...data, ...value}}));
          props.setCurrent(1);
          message.success("User data successfully updated");
        })
        .catch((error: any) => {
          handleError(error);
          loading.stopLoading();
        });
    } else {
      userService
        .instructor_register(data)
        .then(({ data: value }) => {
          props.setUserId(value.user_id);
          message.success("successfully Registered check your email");
          localstorage.setKeyValue("userId", value.user_id);
          loading.stopLoading();
          props.setCurrent(1);
          router.push("/login");
        })
        .catch((error: any) => {
          handleError(error);
          loading.stopLoading();
        });
    }
  };

  const handleError = (error: any) => {
    const errors = error?.response?.data?.error?.details;
    for (const err in errors) {
      if (err === "non_field_errors") {
        registerForm.setError("root", { message: errors[err] });
      } else {
        registerForm.setError(err as keyof User, { message: errors[err] });
      }
    }
  };

  const passwordStrength = async (password: string) => {
    const isCommonPassword = await pwnedPassword(password);
    const score = evaluatePasswordStrength(password);
    switch (score) {
      case 0:
        setPassStrength(30);
        break;
      case 1:
        setPassStrength(60);
        break;
      case 2:
        if (isCommonPassword) {
          setPassStrength(60);
        } else {
          setPassStrength(85);
        }
        break;
      case 3:
      case 4:
        if (isCommonPassword) {
          setPassStrength(60);
        } else {
          setPassStrength(100);
        }
        break;
      default:
        setPassStrength(0);
        break;
    }
  };

  function evaluatePasswordStrength(password: string) {
    const result = zxcvbn(password);
    return result.score; // Returns a score from 0 to 4 indicating password strength
  }

  return (
    <div className="relative w-full pb-20 max-sm:px-3">
      <form onSubmit={registerForm.handleSubmit(onSubmit)}>
        {/* <div className="flex flex-col flex-wrap items-center gap-x-4" >               */}
        <div className="sm:grid gap-y-4 gap-x-20  grid-cols-2">
          <div className="">
            <CustomFileUploader
              className="w-[320px]"
              register={registerForm.register}
              fileType={ContentType.IMAGE}
              label="profile_pic"
              control={registerForm.control}
              placeholder="Profile Picture"
              imageUrlValue={user?.profile_picture || ""}
              setValue={registerForm.setValue}
            />
          </div>
          <div>
          <CustomInput
            type="text"
            className="w-full md:w-80"
            tooltipdescription={translate("full_name_eg")}
            placeholder={translate("full_name")}
            {...registerForm}
            label="full_name"
            error={registerForm.formState.errors.full_name}
            options={{
              required: "full name is required",
              validate: {
                validateNotOnlyNumber: validateNotOnlyNumber,
                validateNameIsFullName: (name) => {
                  return (
                    name!.toString().trim().split(" ")?.length === 3 ||
                    "Please enter a correct full name (e.g, Abebe Kebede Alemu)"
                  );
                },
              },
            }}
          />

          <CustomInput
            type="text"
            className="w-full md:w-80"
            tooltipdescription={"Eg: john(login with it later)"}
            title={translate("username")}
            placeholder={translate("username")}
            {...registerForm}
            label="username"
            options={{
              required: "username is required",
            }}
          />
           <CustomInput
            type="email"
            className="w-full md:w-80"
            placeholder={translate("email")}
            {...registerForm}
            label="email"
            options={{
              required: "email is required",
            }}
          />
          <CustomDropdown
            type="select"
            data={GenderOption}
            key="gender"
            placeholder="Gender"
            className="w-full mt-1 max-sm:mt-3 md:w-80"
            {...registerForm}
            label="gender"
            options={{
              required: "Gender is required",
            }}
            isSearchable={false}
            control={registerForm.control}
            error={registerForm.formState.errors.gender}
          />
          </div>

          <div className="w-full md:w-80">
            <label
              className="flex gap-1 text-xs text-slate-500"
              htmlFor="Phone number"
            >
              {<FaStarOfLife style={{ width: "7px" }} />}
              <span>{"phone number"}</span>
            </label>
            <Controller
              name="phone_number"
              control={control}
              rules={{
                validate: (value) =>
                  isPhoneValid(value) || "Please enter valid phone number",
                required: "Phone number is required",
              }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  defaultCountry="et"
                  value={value}
                  onChange={onChange}
                  className="border-2 border-solid rounded-xl focus:outline-custom_orange-900 focus:border-custom_orange-800"
                />
              )}
            />
            {formState.errors["phone_number"] && (
              <CustomInputError msg={formState.errors.phone_number?.message} />
            )}
          </div>

          
          {!user.username && (
            <>
              <CustomInput
                type={`${isVisible ? "text" : "password"}`}
                className="w-full md:w-80 md:hidden"
                placeholder={translate("password")}
                {...registerForm}
                label="password1"
                options={{
                  required: "password is required",
                }}
                // onValueChange={(e)=>passwordStrength(e.target.value)}
              />
              {/* <CustomProgress passStrength={passStrength}  className="w-full md:w-80 md:hidden" /> */}
              <CustomShowPassword
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                className="md:hidden"
              />
            </>
          )}
          {!user.username && (
            <div className="flex flex-col justify-start max-md:hidden">
              <CustomInput
                type={`${isVisible ? "text" : "password"}`}
                className="w-full md:w-80 "
                placeholder={translate("password")}
                {...registerForm}
                label="password1"
                options={{
                  required: "password is required",
                }}
                // onValueChange={(e)=>passwordStrength(e.target.value)}
              />
              {/* <CustomProgress passStrength={passStrength}  className="w-full md:w-80 " /> */}
              <CustomShowPassword
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                className="flex self-start"
              />
            </div>
          )}
          {/* </div> */}
          <div className="w-full col-span-2">
            <CustomTextArea
              {...registerForm}
              label="bio"
              title="About"
              error={registerForm.formState.errors.bio}
              options={{
                required: "About is required",
              }}
              placeholder="Tell us about your tutoring or teaching experience"
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-col items-center my-5 space-x-2 md:flex-row md:justify-center ">
          <div className="w-full md:w-1/3">
            <CustomButton
              type="submit"
              text={
                !user.username
                  ? translate("create_an_account")
                  : translate("update_an_account")
              }
              is_loading={<SmallLoading {...loading} />}
            />
          </div>
          {user.username && (
            <div className="w-full md:w-1/3">
              <CustomButton
                type="button"
                text={translate("next")}
                fun={() => props.setCurrent(1)}
                is_loading={<SmallLoading {...loading} />}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default InstructorBasicInfo;
