"use client"
import Footer from "@/components/layout/footer/Footer";
import useUserPages from "@/components/account/auth/UserPages";
import InstructorUser from "@/components/account/auth/InstructorUser";
import { UserType } from "@/types/Enums";
import Header from "@/components/layout/header/Header";

export interface Props {
  user_type: string;
}
function InstructorRegister({user_type}:Props) {
  const UserPages = useUserPages();

  return (
    <>
      <Header title="Registration" activeTab="register" underlined="" />
      <InstructorUser page={user_type === UserType.INSTRUCTOR? UserPages.instructor_register:UserPages.tutor_register} />
      {/* <DownloadSection /> */}
      <Footer />
    </>
  );
}

export default InstructorRegister;
