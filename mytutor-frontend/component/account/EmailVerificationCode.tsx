"use client"
import DownloadSection from "@/components/courses/download/DownloadSection";
import Footer from "@/components/layout/footer/Footer";
import User from "@/components/account/auth/User";
import Header from "@/components/layout/header/Header";
import { UserPage } from "@/types/UserPages";
import UserEmailVerification from "@/components/account/auth/UserEmailVerification";
import useTranslation from "@/utils/translation";
import useUserPages from "@/components/account/auth/UserPages";

function EmailVerificationCode() {
  const UserPages = useUserPages();
  
  return (
    <>
      <Header title="Verification code" activeTab="verification_code" />
      <User page={UserPages.email_verification_code} />
      <DownloadSection />
      <Footer />
    </>
  );
}

export default EmailVerificationCode;