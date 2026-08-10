"use client";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import useAuthentication from "../../account/auth/authentication";
import { useUserService } from "../../account/auth/UserService";
import { refreshKey, tokenKey } from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBookOpen, FiLogOut } from "react-icons/fi";
import { Image } from "antd";
import { Popover, Space } from "antd";
import logo from "../../../assets/images/logo.png";
import CustomText from "../../customs/custom-text/CustomText";
import { removeUser } from "@/state/store/slices/userSlices";
import { AppState } from "@/state/store/store";
import { isMObile } from "@/utils/modal";

interface Props {
  title: string;
}

function DashboardHeader(props: Props) {
  const user = useSelector((state: AppState) => state.user);
  const authentication = useAuthentication();
  const userService = useUserService();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    userService.logout().then(() => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshKey);
      dispatch(removeUser());
      router.push("/login");
    });
  };

  function cropName(str: string) {
    return str?.substring(0, 1)?.charAt(0)?.toUpperCase();
  }

  const content = (
    <>
      <div className="z-50 w-32 bg-white border border-gray-300 rounded-md shadow-lg right-16">
        <Link
          href="/login"
          onClick={handleLogout}
          className="flex items-center justify-start px-4 py-2 text-gray-800 hover:bg-gray-200"
        >
          <FiLogOut className="mr-2"></FiLogOut>
          <span>Log out</span>
        </Link>
      </div>
      <div className="lg:mt-3 z-50 w-32 bg-white border border-gray-300  md:hidden rounded-md shadow-lg right-16 mt-2">
        <Link
          href={"/"}
          className="flex justify-start px-4 py-2 text-gray-800 hover:bg-gray-200"
        >
          <FiBookOpen className="mt-1" />
          <span className="px-1">Student page</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {authentication.isLoggedIn() ? (
        <div className="sticky top-0 z-50 max-h-16 flex items-center justify-between w-full p-0 flex-nowrap bg-custom_black-200">
          <div className=" bg-custom_black-300">
            <Link href="/">
              <Image
                preview={false}
                src="/images/logo.png"
                height={50}
                width={70}
                alt="Image not found"
                className="pl-1 align-middle sm:pl-4 bg-custom_black-200"
              />
            </Link>
          </div>
          <h1 className="w-full pl-2 text-xl max-sm:hidden text-left md:pl-10 text-custom_orange-900 md:text-3xl">
            {/* <CustomText text={props.title || "Dashboard"} />{" "} */}
          </h1>
          <div className="flex items-center mr-2 lg:pr-6 lg:space-x-2">
            <div className="flex text-white max-md:hidden">
              <FiBookOpen className="mt-1" />
              <Link href={"/"}>
                <p className="px-1  text-custom_orange-900 m-0 text-sm">Student</p>
              </Link>
            </div>
            <div>
              <span className="px-1 text-custom_orange-900">
                {user.username}
              </span>
            </div>
            <div className="flex items-center justify-center ">
              {authentication.isLoggedIn() && (
                <Space wrap>
                  <Popover content={content} trigger="hover">
                    <div className="w-10 h-10 rounded-full bg-custom_orange-800 text-white shadow-sm flex justify-center place-items-center cursor-pointer">
                      {user.profile_picture ? (
                        <Image
                          preview={false}
                          width={40}
                          height={40}
                          src={user.profile_picture as string}
                          alt="Image not found"
                          className="w-10 h-10 lg:w-29 rounded-full border-white"
                        />
                      ) : (
                        <span className="text-white">
                          {cropName(user.first_name) + cropName(user.last_name)}
                        </span>
                      )}
                    </div>
                  </Popover>
                </Space>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default DashboardHeader;
