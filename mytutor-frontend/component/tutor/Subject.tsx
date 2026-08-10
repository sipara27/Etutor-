"use client"
import { useForm } from "react-hook-form";
import SubjectAdd from "@/components/tutors/subject/SubjectAdd";
import SubjectList from "@/components/tutors/subject/SubjectList";
import { Subject } from "@/components/tutors/subject/SubjectService";
import useSubjectService from "@/components/tutors/subject/SubjectService";
import { useEffect, useState } from "react";
import { Modal } from "antd";
import { IsWindowUndefined } from "@/utils/func_utils";

const SubjectPage = () => {
  const subjectForm = useForm<Subject>({});
  const [createSubject, setCreateSubject] = useState(false)
  const subjectService = useSubjectService();
  const [data, setData] = useState<Subject[]>([]);

  const cancle = () => {
    setCreateSubject(false)
    subjectForm.reset()
  }

  // Remove duplicate fetch - let SubjectList handle its own data fetching
  // const getSubject = () => {
  //   subjectService
  //     .getSubjects()
  //     .then((value) => [setData(value.data.results)]);
  // };

  // useEffect(() => {
  //   getSubject();
  // }, []);

  return (
    <>
      <SubjectList data={[]} />

    </>
  );
};
export default SubjectPage;
