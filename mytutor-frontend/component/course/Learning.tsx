"use client";
import { Tabs, TabsProps } from "antd";
import AllCourses from "@/components/courses/learning/AllCourses";
import ProfileDetail from "@/components/account/profile/ProfileDetail";
import { useEffect, useRef } from "react";
import ETutorContractList from "@/components/tutors/etutorContract/ETutorContractList";
import { Outlet } from "react-router-dom";
import { useParams, useRouter } from "next/navigation";
import { IsWindowUndefined } from "@/utils/func_utils";
import CoursePaymentList from "@/app/(home)/portal/course_payment/page";

const Learning = () => {
  const myRef = useRef(null);
  const router = useRouter();

  const onChange = (key: string) => {};
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (IsWindowUndefined()) {
      const element = document.getElementsByClassName(
        window?.location.hash ? window?.location.hash.slice(1) : ""
      )?.[0];
      element?.scroll({ top: 0, behavior: "smooth" });
    }
  }, [router]);

  const items: TabsProps["items"] = [
    {
      key: "profile",
      label: "My Profile",
      children: (
        <div className="container mx-auto">
          <ProfileDetail />
        </div>
      ),
    },
    {
      key: "my_course",
      label: "My Course",
      children: (
        <div className="container mx-auto">
          <AllCourses />
        </div>
      ),
    },
    {
      key: "my_tutor",
      label: "My Tutor",
      children: (
        <div className="container mx-auto">
          <ETutorContractList url={"portal"} />
        </div>
      ),
    },
    {
      key: "course_payment",
      label: "Course Payment",
      children: (
        <div className="container mx-auto">
          <CoursePaymentList />
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className=" pt-4 profile my_tutor course_payment min-h-[700px]"
        id="portal"
      >
        <h1 className="py-6 text-3xl font-bold text-center text-white bg-custom_orange-700">
          My Portal
        </h1>
        {!params.id && (
          <Tabs
            className="flex flex-wrap items-center w-full learning"
            defaultActiveKey={
              IsWindowUndefined() ? window?.location.hash.slice(1) : ""
            }
            items={items}
            onChange={onChange}
            destroyInactiveTabPane
          />
        )}
        <Outlet />
      </div>
    </>
  );
};

export default Learning;
