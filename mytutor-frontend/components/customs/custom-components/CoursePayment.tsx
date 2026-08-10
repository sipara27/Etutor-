import { FiFacebook, FiLinkedin, FiTwitter } from "react-icons/fi";
import { CourseEnrolled } from "../../../types/Course";
import CustomButton from "../custom-button/CustomButton";
import { FaBook, FaTelegram } from "react-icons/fa";
import { GiDuration, GiLevelEndFlag } from "react-icons/gi";
import { MdOndemandVideo } from "react-icons/md";
import useAuthentication from "../../account/auth/authentication";
import useEnrollmentService from "../../courses/course/EnrollmentService";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { LocalStorage } from "../../../utils/localstorage";
import { getLabelByValue } from "../../../utils/array";
import { courseLevel, courseTypeEnum } from "../../../types/Enums";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IsWindowUndefined } from "@/utils/func_utils";
import useSocialMedia from "@/hooks/socialMedia/useSocialMedia";
import { eth_currency } from "@/utils/stringUtils";
import usePaymentService from "@/components/tutors/finance/payment/usePaymentService";
import useCoursePaymentService from "@/app/(home)/portal/course_payment/useCoursePayment";
import { CoursePaymentType } from "@/app/(home)/portal/course_payment/CoursePayment.model";

interface Props {
  course?: CourseEnrolled;
  id?: string;
}

export const CoursePayment = (props: Props) => {
  const authentication = useAuthentication();
  const paymentService = usePaymentService();
  const router = useRouter();
  const user = useSelector((state: AppState) => state.user);
  const enrollmentService = useEnrollmentService();
  const coursePaymentRequest = useCoursePaymentService();
  const [isCopied, setIsCopied] = useState(false);
  const { handleFacebook, handleLinkedin, handleTelegram, handleTweet } =
    useSocialMedia({
      title: props.course?.name || "MyTutor course",
      text: props.course?.name
        ? `Take a look at ${props.course.name} on MyTutor`
        : "Take a look at this course on MyTutor",
    });

  const handleCopy = async () => {
    if (!IsWindowUndefined()) return;

    await navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEnrollment = () => {
    const data = { course: props.course?.id };
    if (props.course?.is_enrolled) {
      return router.push(`/course_detail/${props.id}/contents`);
    } else {
      if (
        props?.course?.course_price &&
        props?.course?.course_type === courseTypeEnum.PREMIUM
      ) {
        let coursePrice = {} as CoursePaymentType;
        coursePrice.course = props.course?.id;
        coursePrice.total_price = props.course?.course_price;
        coursePaymentRequest.addCoursePayment(coursePrice).then((data) => {
          if (data) {
            return router.push(`/portal#course_payment`);
          }
        });
      } else {
        enrollmentService.addCourseEnrollment(data).then((data) => {
          if (data) {
            return router.push(`/course_detail/${props.id}/contents`);
          } else {
            return router.push(`/course_detail/${props.id}`);
          }
        });
      }
    }
  };

  const paymentRequestGenerate = () => {
    // paymentService.
  };

  const handleSaveRegisterCurrentPage = () => {
    setLocalstorage();
    router.push("/student_register");
  };
  const handleSaveLoginCurrentPage = () => {
    setLocalstorage();
    router.push("/login");
  };
  const setLocalstorage = () => {
    const localstorage = new LocalStorage();
    localstorage.setKeyValue(
      "enrolmentpage",
      IsWindowUndefined() ? window?.location.pathname : ""
    );
  };

  return (
    <div className=" w-full lg:pl-10">
      <div className="bg-custom_light_green p-10 border border-custom_orange-900 rounded-xl">
        <h1 className="text-3xl font-bold text-custom_orange-900 text-center">
          {props.course?.course_price
            ? props.course.course_price + eth_currency
            : "Free"}
        </h1>
        <ul className="border-t mt-9">
          <li className="border-b py-2">
            <i className="text-lg pr-1 text-custom_orange-900 inline-block">
              <GiDuration></GiDuration>
            </i>
            <strong className="text-lg font-medium text-custom_black">
              Duration
            </strong>
            <span className="block float-right font-normal text-lg text-gray-500">
              {props.course?.durations?.slice(0, -3)}hr
            </span>
          </li>
          <li className="border-b py-4">
            <i className="text-lg mr-1 text-custom_orange-900 inline-block">
              <MdOndemandVideo></MdOndemandVideo>
            </i>
            <strong className="text-lg font-medium text-custom_black">
              Lectures
            </strong>
            <span className="block float-right font-normal text-lg text-gray-500">
              {props.course?.contents}
            </span>
          </li>
          <li className="border-b py-4">
            <i className="text-lg mr-1 text-custom_orange-900 inline-block">
              <GiLevelEndFlag></GiLevelEndFlag>
            </i>
            <strong className="text-lg font-medium text-custom_black">
              Level
            </strong>
            <span className="block float-right font-normal text-lg text-gray-500">
              {getLabelByValue(
                courseLevel,
                parseInt(props.course?.course_level!)
              )}
            </span>
          </li>
          <li className="border-b py-4">
            <i className="text-lg mr-1 text-custom_orange-900 inline-block">
              <FaBook></FaBook>
            </i>
            <strong className="text-lg font-medium text-custom_black">
              Language
            </strong>
            <span className="block float-right font-normal text-lg text-gray-500">
              English
            </span>
          </li>
        </ul>
        {!authentication.isLoggedIn() ? (
          <h1 className="text-custom_orange-900 font-extrabold text-xl mt-10">
            To enroll this course
          </h1>
        ) : (
          ""
        )}
        {!user.is_superuser &&
          (authentication.isLoggedIn() ? (
            <>
              <CustomButton
                text={
                  props.course?.is_enrolled
                    ? "Go To Course"
                    : props.course?.course_price
                    ? "Buy Now"
                    : "Enroll Now"
                }
                fun={handleEnrollment}
              />
            </>
          ) : (
            <div className="flex max-sm:flex-wrap gap-4">
              <CustomButton
                // to="/student_register"
                text={"Register here"}
                fun={() => handleSaveRegisterCurrentPage()}
                className="bg-custom_orange-700 text-white w-full p-4 mt-1 border rounded-2xl flex justify-center !leading-3"
              />
              <CustomButton
                // to="/login"
                text={"Login here"}
                fun={() => handleSaveLoginCurrentPage()}
                className="bg-custom_orange-700 text-white p-4 w-full mt-1 border rounded-2xl flex justify-center !leading-3"
              />
            </div>
          ))}
      </div>
      <div className="mt-12">
        <h4 className="text-2xl font-medium -mt-2 mb-0">Share Course:</h4>
        <button
          type="button"
          onClick={handleCopy}
          className={`relative overflow-hidden w-full cursor-pointer mt-5 leading-[3.75rem] rounded-xl text-sm sm:text-lg sm:leading-[3.75rem] font-medium transition-all duration-300 ease-in inline-block px-8 whitespace-nowrap bg-custom_orange-900 text-white hover:text-custom_orange-900 hover:bg-white ${
            isCopied ? "copied" : ""
          }`}
        >
          {isCopied ? "Course Link Copied" : "Copy Course Link"}
        </button>
        <ul className="flex justify-between mt-6 flex-wrap">
          <li className="pt-2 mr-2">
            <button
              type="button"
              onClick={handleFacebook}
              aria-label="Share this course on Facebook"
              title="Share on Facebook"
              className="w-12 h-12 leading-[52px] border border-custom_light_green rounded-lg
      flex items-center justify-center text-lg text-custom_black transition-all duration-300 ease-in"
            >
              <i>
                <FiFacebook></FiFacebook>
              </i>
            </button>
          </li>
          <li className="pt-2 mr-2">
            <button
              type="button"
              onClick={handleLinkedin}
              aria-label="Share this course on LinkedIn"
              title="Share on LinkedIn"
              className="w-12 h-12 leading-[52px] border border-custom_light_green rounded-lg
      flex items-center justify-center text-lg text-custom_black transition-all duration-300 ease-in"
            >
              <i>
                <FiLinkedin></FiLinkedin>
              </i>
            </button>
          </li>
          <li className="pt-2 mr-2">
            <button
              type="button"
              onClick={handleTelegram}
              aria-label="Share this course on Telegram"
              title="Share on Telegram"
              className="w-12 h-12 leading-[52px] border border-custom_light_green rounded-lg
      flex items-center justify-center text-lg text-custom_black transition-all duration-300 ease-in"
            >
              <i>
                <FaTelegram />
              </i>
            </button>
          </li>
          <li className="pt-2 mr-2">
            <button
              type="button"
              onClick={handleTweet}
              aria-label="Share this course on X"
              title="Share on X"
              className="w-12 h-12 leading-[52px] border border-custom_light_green rounded-lg
      flex items-center justify-center text-lg text-custom_black transition-all duration-300 ease-in"
            >
              <i>
                <FiTwitter></FiTwitter>
              </i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
