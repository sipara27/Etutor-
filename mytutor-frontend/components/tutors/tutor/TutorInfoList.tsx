"use client";
import { useEffect, useState } from "react";
import {
  ActionStatusName,
  componentType,
  daysOption,
  tutorTypeOptions,
} from "../../../types/Enums";
import CustomText from "../../customs/custom-text/CustomText";
import { usePagination } from "../../customs/pagination/usePagination";
import SearchBar from "../../commons/search-bar/SearchBar";
import { SearchComponentProps } from "../../commons/search-bar/search";
import useTutorService from "./ToturService";
import { Avatar, Card } from "antd";
import { Rating } from "../../customs/custom-components/Star";
import { IoLocation, IoTime } from "react-icons/io5";
import { getLabelByValue } from "../../../utils/array";
import Link from "next/link";
import { AvailableTime, Tutor, TutorInfoFilterModel } from "./TutorInfoModel";
import { AppState } from "@/state/store/store";
import { useSelector } from "react-redux";
import { isVisible } from "../../account/auth/authorization";
import { SelectItem } from "../../../types/MenuItems";
import useSubjectService, { Subject } from "../subject/SubjectService";
import useLoading from "../../customs/loading/LoadingHook";
import Loading from "../../customs/loading/Loading";
import { generateUniqueKey } from "@/utils/func_utils";
import _ from 'lodash'
import useGradeService, { Grade } from "../grade/GradeService";
import { useSearchParams } from "next/navigation";

const TutorInfoList = () => {
  const [tutorDatas, setTutorDatas] = useState<Tutor[]>([]);
  const user = useSelector((state: AppState) => state.user);
  const [showMore, setShowMore] = useState(true);
  const gradeService = useGradeService()
  const [preferredSubjectOptions, setPreferredSubjectOptions] = useState<
    SelectItem<string>[]
  >([]);

  const [preferredGradeOptions, setPreferredGradeOptions] = useState<
  SelectItem<string>[]
>([]);
  const tutorService = useTutorService();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search")?.trim();
  const paginator = usePagination<TutorInfoFilterModel>({
    status: ActionStatusName.RequestApproved,
    ps: 5,
    is_home: true,
    ...(initialSearch ? { search: initialSearch } : {}),
  });
  const loadingService = useLoading();
  const subjectService = useSubjectService();

  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
    {
      placeholder: "Grade",
      key: "tutor_type",
      type: componentType.DROPDOWN,
      // ismultiple:"multiple",
      options: preferredGradeOptions,
    },
    {
      placeholder: "Preferred Subject",
      key: "preferred_subject",
      type: componentType.DROPDOWN,
      options: preferredSubjectOptions,
    },
  ];

  useEffect(() => {
    getGrades()
    searchTutors();
    getPreferredSubjects();
  }, [paginator.filterData]);

  const getGrades = (search: string = "") => {
    gradeService.getGrades({ search }).then(({ data: value }) => {
      if (value) {
        setPreferredGradeOptions(
          value.results.map((val: Grade) => ({
            label: val.grade_name,
            value: val.id,
          }))
        );
      }
    });
  };
  

  const searchTutors = () => {
    loadingService.startLoading();
    tutorService
      .getTutors(paginator.filterData)
      .then(({ data: response }) => {
        if (response.results) {
          setTutorDatas(
            showMore ? [...tutorDatas, ...response.results] : response.results
          );
          paginator.setNext(response.next);
          setShowMore(false);
        }
        loadingService.stopLoading();
      })
      .catch((error) => loadingService.stopLoading());
  };

  const getPreferredSubjects = () => {
    subjectService.getSubjects().then(({ data: value }) => {
      if (value) {
        setPreferredSubjectOptions(
          value.results.map((val: Subject) => ({
            label: val.subject_name,
            value: val.id,
          }))
        );
      }
    });
  };

  const filterUniqueDays = (times: AvailableTime[]) => {
    const seenDays = new Set<number>();
    return times.filter((time) => {
      if (!seenDays.has(time.day) && time.day >= 1 && time.day <= 7) {
        seenDays.add(time.day);
        return true;
      }
      return false;
    });
  };
  return (
    <>
      <div className="container mx-auto min-h-[700px]">
        <div className="border-b-2 border-b-custom_orange-900 py-2 md:py-4 mt-32 md:mt-0">
          <h1 className="text-center text-2xl py-0 md:py-2">
            Tutor <CustomText text="List" />
          </h1>
          <SearchBar
            components={components}
            handleChange={paginator.handleChange}
            filteredData={paginator.filterData}
          />
        </div>
        <div className="flex flex-col md:flex-row  my-2 gap-4">
          <Card className="  w-full lg:w-1/4 absolute top-0 px-0  md:sticky md:top-10">
            <span className="font-semibold hidden md:block">Welcome to Mytutor</span> <br />
            <br />
            <p className="mt-10 text-[16px] leading-[1.8] font-normal text-[#52565b]  text-center sm:text-justify ">
            Create Your Tutor Profile Now & Let Students Find You! Enjoy flexible hours
            and competitive pay while making a difference!
            <span className={`font-semibold ${isVisible(!user.is_staff)}`}>
            
          
            <span className="text-custom_orange-700">
              <Link href="/tutor_register" className="text-custom_orange-700"> Apply Here:</Link>
            </span>
            
          </span>
        </p>
             
            
          </Card>
          <div className="flex flex-col gap-4 w-full relative lg:w-3/4">
            <Loading {...loadingService} />
            {tutorDatas.map((tutorData) => (
              <Card
                key={tutorData.id + generateUniqueKey()}
                className="shadow-md"
              >
                <div className="flex flex-row flex-wrap lg:flex-nowrap gap-4 m-0">
                  <div className="flex gap-4">
                    <div className=" w-20 h-20 lg:w-40 lg:h-40">
                      <Link href={"/tutors/" + tutorData.id}>
                        {tutorData.profile_picture ? (
                          <Avatar
                            src={tutorData.profile_picture}
                            shape="square"
                            className="w-full h-full"
                          />
                        ) : (
                          <Avatar
                            src="/profile_avatar.jpg"
                            shape="square"
                            className="w-full h-full"
                          />
                        )}
                      </Link>
                    </div>
                    <div className=" lg:hidden">
                      <h1 className="text-start text-lg">
                        {" "}
                        {tutorData.tutor_name}
                      </h1>
                      <div className="flex gap-2">
                        <Rating rating={Number(tutorData.rating) || 0} />
                        <span className="font-semibold">
                          {_.round(Number(tutorData.rating) || 0, 2)}
                        </span>
                        <span>({tutorData.reviews || 0} reviews)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">
                          {tutorData.preferred_subject_names?.map((val) => (
                            <a key={val}>{val}, </a>
                          )) || 0}
                        </span>
                      </div>
                      <div className="font-bold">
                        Br{tutorData.hourly_rate} / hr
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full relative md:pb-10">
                    <div className="hidden lg:block relative w-full">
                      <Link href={"/tutors/" + tutorData.id}>
                        {" "}
                        <h1 className="text-start text-lg">
                          {" "}
                          {tutorData.tutor_name}
                        </h1>
                      </Link>
                      <div className="flex gap-2">
                        <Rating rating={Number(tutorData.rating) || 0} />
                        <span className="font-semibold">
                          {_.round(Number(tutorData.rating) || 0, 2)}
                        </span>
                        <span>({tutorData.reviews || 0} reviews)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold">
                          {tutorData.preferred_subject_names?.map((val) => (
                            <a key={val}>{val}, </a>
                          )) || 0}
                        </span>
                      </div>
                      <div className="absolute top-0 right-2 font-semibold">
                        Br{tutorData.hourly_rate} / hr
                      </div>
                    </div>
                    <hr className="hidden md:block" />
                    <p className="">
                      {tutorData.introduction.length <= 324
                        ? tutorData.introduction
                        : tutorData.introduction.slice(0, 324) + " ..."}
                    </p>
                    <div className="lg:absolute bottom-0 flex flex-wrap gap-2 lg:gap-4">
                      {" "}
                      <div className="bg-custom_orange-100 w-fit p-2 gap-2 flex items-center">
                        {/* {getLabelByValue(
                          tutorTypeOptions,
                          parseInt(tutorData.tutor_type)
                        )}{" "} */}
                        {tutorData.preferred_grade_names?.join(", ")}
                      </div>
                      <div className="bg-custom_orange-100 w-fit p-2 gap-1 flex items-center">
                        {" "}
                        <IoLocation />{" "}
                        <span>
                          {tutorData.zone_name} - {tutorData.woreda_name}
                        </span>
                      </div>
                      <div className="bg-custom_orange-100 w-fit p-2 gap-1 flex items-center">
                        {" "}
                        <IoTime />{" "}
                        <span>
                          {tutorData.total_hour || 0}
                        </span>
                      </div>
                      <div className="flex gap-1 p-1 border-solid border-custom_orange-200 border-2">
                        {filterUniqueDays(tutorData.availabilty_times)
                          .sort((a: any, b: any) => a.day - b.day)
                          .map((value: any) => (
                            <div
                              key={value}
                              className="bg-custom_orange-100 w-fit p-1 gap-2 flex items-center"
                            >
                              {" "}
                              {getLabelByValue(daysOption, value.day)}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {paginator.next && (
              <button
                className="bg-gray-200 self-center text-custom_orange-800 px-3 py-2 mt-3 rounded-lg"
                onClick={() => {
                  // paginator.handleChange(
                  //   "pn",
                  //   1 + (paginator.filterData.pn || 0)
                  // );
                  paginator.onPageNumberChange(1 + (paginator.filterData.pn || 0))
                  setShowMore(true);
                }}
              >
                show more
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorInfoList;
