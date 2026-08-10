"use client";
import { use, useState } from "react";
import { Avatar, Button, Card, Divider, Modal } from "antd";
import useLoading from "../../customs/loading/LoadingHook";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import useUserService from "../user/UserService";
import { PartialUser, User } from "../../../types/UserItem";
import { Language, Languages } from "../../../types/Translation";
import { SelectItem } from "../../../types/MenuItems";
import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import useTranslation from "../../../utils/translation";
import { SubmitHandler, useForm } from "react-hook-form";
import CustomImageFileInput from "../../customs/custom-input/CustomImageFileInput";
import useFileService from "../../commons/file/FileService";
import CustomButton from "../../customs/custom-button/CustomButton";
import ProfileUpdate from "./ProfileUpdate";
import SmallLoading from "../../customs/loading/SmallLoading";
import PasswordChange from "../auth/PasswordChange";
import useAuthentication from "../auth/authentication";
import { getUser, setLanguage } from "@/state/store/slices/userSlices";
import { IsWindowUndefined } from "@/utils/func_utils";
import Loading from "@/components/customs/loading/Loading";
import { useRouter } from "next/navigation";

export const languages: SelectItem<string | number>[] = [
  { label: "Amharic", value: Languages.AMH },
  { label: "English", value: Languages.ENG },
];

const enum componentEnum {
  profile_pic = 100,
  password,
  edit,
}
const ProfileDetail = () => {
  const router = useRouter();
  const {
    register,
    control,
    formState: { errors },
  } = useForm<Language>();
  const [open, setOpen] = useState(false);
  const user = useSelector((state: AppState) => state.user);
  const registerForm = useForm<User>({ defaultValues: user });
  const fileService = useFileService();
  const [component, setComponent] = useState(100);
  const loading = useLoading();
  const userService = useUserService();
  const dispatch = useDispatch();

  const authentication = useAuthentication();
  const { translate } = useTranslation();

  const applyLanguage: (val: string) => void = (val: string) => {
    let data: PartialUser = { lang: val as Languages };
    userService.updateUser(user.id, data).then((val) => {
      dispatch(setLanguage(val.data.lang));
    });
  };

  const onSubmit: SubmitHandler<User> = (data) => {
    loading.startLoading();
    const formData = new FormData();
    formData.append(
      "url",
      data?.profile_pic[0] as Blob,
      (data?.profile_pic[0] as File)?.name
    );
    formData.append("file_type", "101");
    fileService.addFile(formData).then(({ data: value }) => {
      data.profile_pic = value.id;
      if (!data.bio) {
        data.bio = `I am ${data.first_name} ${data.middle_name} ${data.last_name} `;
      }
      userService
        .editUser(data)
        .then(({ data: value }) => {
          const user = getUser({ ...{...data, ...value}, lang: value.lang })
          dispatch(user);
          onClose(value);
          loading.stopLoading();
        })
        .catch((error) => loading.stopLoading());
    });
  };

  const onClose = (value: any = null) => {
    setOpen(false);
    setComponent(100);
  };

  return (
    <>
      <Loading {...loading} />
      {authentication.isLoggedIn() ? (
        <>
          <div className="flex gap-2 flex-wrap pb-2 w-full">
            <div
              key={user?.id}
              className="group relative w-full flex items-center justify-center"
            >
              <Card className="hover:border-gray-200">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex flex-row flex-wrap max-w-80 gap-2 items-start justify-center text-xl">
                    <Button
                      onClick={() => {
                        setOpen(true);
                        setComponent(componentEnum.profile_pic);
                      }}
                    >
                      Change Profile Pic
                    </Button>
                    <div
                      className="mt-2 mx-1 w-full md:-order-1  text-white 
                        justify-center flex"
                    >
                      {user?.profile_picture ? (
                        <Avatar
                          src={user?.profile_picture as string}
                          alt="Image not found"
                          size={100}
                          className="bg-custom_orange-800 border-white"
                        />
                      ) : (
                        <span className="font-bold rounded-full  p-7 shadow-sm text-center bg-custom_orange-800 text-3xl">
                          {user?.first_name?.[0]}
                          {user?.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    {/* <div className='flex gap-2'> */}
                    <Button
                      onClick={() => {
                        setOpen(true);
                        setComponent(componentEnum.password);
                      }}
                      className={`bg-gray-400`}
                    >
                      Change Password
                    </Button>
                    {/* </div> */}
                    <CustomDropdown
                      placeholder={translate("languages")}
                      data={languages}
                      val={user?.lang}
                      onValueChange={(value) => applyLanguage(value)}
                      id="id"
                      label="language"
                      control={control}
                      isSearchable={false}
                      register={register}
                    />
                  </div>
                  <Divider
                    type={
                      IsWindowUndefined() && window?.innerWidth <= 768
                        ? "horizontal"
                        : "vertical"
                    }
                    className=""
                  />
                  <div className="mx-5">
                    <div className="my-3">
                      <span className="font-bold">Full Name:</span>{" "}
                      {user?.first_name} {user?.middle_name} {user?.last_name}
                    </div>
                    <div className="my-3">
                      <span className="font-bold">Username:</span>{" "}
                      {user?.username}
                    </div>
                    <div className="my-3">
                      <span className="font-bold">Phone No:</span>{" "}
                      {user?.phone_number}
                    </div>
                    <div className="my-3">
                      <span className="font-bold">Email: </span>
                      {user?.email}
                    </div>
                  </div>
                  <Divider
                    type={
                      IsWindowUndefined() && window?.innerWidth <= 768
                        ? "horizontal"
                        : "vertical"
                    }
                    className=""
                  />
                  <div className="mx-5 lg:w-48">
                    <div className="my-1">
                      <div className="font-bold">About</div> {user?.bio}
                    </div>
                    <Button
                      className="my-3"
                      onClick={() => {
                        setOpen(true);
                        setComponent(componentEnum.edit);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <Modal destroyOnClose open={open} onCancel={() => onClose()} footer={[]}>
            {component === componentEnum.edit ? (
              <ProfileUpdate onClose={onClose} />
            ) : component === componentEnum.password ? (
              <PasswordChange onClose={onClose} />
            ) : (
              <form
                onSubmit={registerForm.handleSubmit(onSubmit)}
                className="flex flex-col items-center"
              >
                <div className="w-fit">
                  <CustomImageFileInput
                    {...registerForm}
                    label="profile_pic"
                    placeholder="Profile picture"
                    options={{
                      required: "profile picture is required!",
                    }}
                    className="mx-20"
                    val={user ? user?.profile_picture : ""}
                    error={registerForm.formState.errors.profile_pic}
                  />
                </div>

                <div className="mt-5 w-full">
                  <CustomButton
                    type="submit"
                    text={"Change Profile"}
                    fun={onClose}
                    is_loading={<SmallLoading {...loading} />}
                  />
                </div>
              </form>
            )}
          </Modal>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default ProfileDetail;
