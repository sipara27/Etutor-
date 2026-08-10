import { Avatar, Card, Dropdown, MenuProps, Progress, Space } from "antd";
import Meta from "antd/es/card/Meta";
import useEnrollmentService from "../course/EnrollmentService";
import { useEffect, useState } from "react";
import { Course, CourseEnrollment } from "../../../types/Course";
import { FaEllipsisV, FaFolder, FaRegStar, FaStar } from "react-icons/fa";
import { IoIosShareAlt, IoMdAdd } from "react-icons/io";
import {
  ButtonReviewStar,
  ButtonStar,
  Rating,
} from "../../customs/custom-components/Star";
import { Image } from "antd";
import { generateUniqueKey } from "@/utils/func_utils";
import Link from "next/link";
import useLoading from "@/components/customs/loading/LoadingHook";
import Loading from "@/components/customs/loading/Loading";

export default function AllCourses() {
  const enrollmentServce = useEnrollmentService();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [rate, setRating] = useState(0);
  const [rateOnHover, setRateOnHover] = useState(0);
  const loading = useLoading();
  const getEnrollments = () => {
    loading.startLoading();
    enrollmentServce.getEnrollments({}).then((value) => {
      setEnrollments(value.data.results);
      loading.stopLoading();
    });
  };

  useEffect(() => {
    getEnrollments();
  }, []);

  const items: MenuProps["items"] = [
    {
      label: "Share",
      key: "1",
      icon: <IoIosShareAlt />,
    },
    {
      label: "Create New List",
      key: "2",
      icon: <IoMdAdd />,
    },
    {
      label: "Favorite",
      key: "3",
      icon: <FaStar />,
    },
    {
      label: "Archive",
      key: "4",
      icon: <FaFolder />,
    },
  ];

  return (
    <>
      <Loading {...loading} />
    <div className="flex justify-center pb-10 w-full flex-wrap m-auto">
      {enrollments.map((enrollment) => {
        const course = enrollment.course as Course;
        return (
          <Link key={course.id} className="w-full sm:w-1/2 md:w-1/3 xl:w-1/4 p-2" href={`course_detail/${course.id}/contents`}>
            <Card
              key={generateUniqueKey()}
              className="relative w-full  cursor-pointer lg:mr-4 mb-4"
              bodyStyle={{ padding: "10px" }}
              cover={
                <Image
                  preview={false}
                  height={176}
                  alt={course.name}
                  src={course.course_image as string}
                  className="h-44"
                />
              }
            >
              <Dropdown
                className="absolute top-2 right-2"
                menu={{ items }}
                trigger={["click"]}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    <FaEllipsisV className="text-lg text-white" />
                  </Space>
                </a>
              </Dropdown>
              ,
              <Meta
                avatar={<Avatar src={course.course_image as string} />}
                title={course.name}
              />
              <Progress
                size={"small"}
                showInfo={false}
                percent={course.progress}
              />
              <div className="flex justify-between">
                <h1>{course.progress}% complete </h1>
                {/* Ratings */}
                <div className="flex gap-1">
                  <ButtonReviewStar
                    rateOnHover={rateOnHover}
                    setRating={setRating}
                    setRateOnHover={setRateOnHover}
                    rating={rate}
                  />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
    </>
  );
}
