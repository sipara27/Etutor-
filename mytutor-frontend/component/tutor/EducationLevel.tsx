"use client"
import { useForm } from "react-hook-form";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { IsWindowUndefined } from "@/utils/func_utils";
import useEducationLevelService, { EducationLevel } from "@/components/tutors/education-level/EducationLevelService";
import EducationLevelList from "@/components/tutors/education-level/EducationLevelList";

const EducationLevelPage = () => {
  const educationlevelForm = useForm<EducationLevel>({});
  const [createEducationLevel, setCreateEducationLevel] = useState(false)
  const educationlevelService = useEducationLevelService();
  const [data, setData] = useState<EducationLevel[]>([]);

  const cancle = () => {
    setCreateEducationLevel(false)
    educationlevelForm.reset()
  }

  // Remove duplicate fetch - let EducationLevelList handle its own data fetching
  // const getEducationLevel = () => {
  //   educationlevelService
  //     .getEducationLevels()
  //     .then((value) => [setData(value.data.results)]);
  // };

  // useEffect(() => {
  //   getEducationLevel();
  // }, []);

  return (
    <>
      <EducationLevelList data={[]} />

    </>
  );
};
export default EducationLevelPage;
