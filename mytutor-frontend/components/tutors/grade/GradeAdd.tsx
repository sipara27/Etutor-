import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import CustomInput from "../../customs/custom-input/CustomInput";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import useTranslation from "../../../utils/translation";
import useLoading from "../../customs/loading/LoadingHook";
import { useEffect, useState } from "react";
import { SelectItem } from "../../../types/MenuItems";
import { SubmitHandler, useForm } from "react-hook-form";
import useGradeService, { Grade } from "./GradeService";
import useCategoryService from "../../courses/category/CategoryService";
import CustomButton from "../../customs/custom-button/CustomButton";
import { message } from "antd";
interface Props {
  getGrade: () => void;
  cancel: () => void;
  detail?: Grade;
}
const GradeAdd = (props: Props) => {
  const gradeForm = useForm<Grade>();
  const [categories, setCategories] = useState<SelectItem<string>[]>([]);
  const loading = useLoading();
  const categoryService = useCategoryService();
  const gradeService = useGradeService();

  const getCategoryData = (filterText: string) => {
    categoryService
      .getCategories({
        ps: 5,
        cursor: "",
        search: filterText,
      })
      .then(({ data: response }) => {
        setCategories(
          response.results.map((resp) => ({
            label: resp.category_name,
            value: resp.id,
          }))
        );
      });
  };

  useEffect(() => {
    getCategoryData("");

    if (props?.detail) {
      gradeForm.reset(props.detail);
    }
  }, []);

  const onSubmit: SubmitHandler<Grade> = (data: Grade) => {
    loading.startLoading();
    if (data.id) {
      gradeService
        .updateGrade(data.id, data)
        .then((value) => {
          if (value) {
            props.getGrade();
            gradeForm.reset();
          }
          loading.stopLoading();
          props.cancel();
          message.success("Successfully updated!");
        })
        .catch((error) => {
          loading.stopLoading();
        });
    } else {
      gradeService
        .addGrade(data)
        .then((value) => {
          if (value) {
            props.getGrade();
            gradeForm.reset();
          }
          loading.stopLoading();
          props.cancel();
          message.success("Successfully added!");
        })
        .catch((error) => {
          loading.stopLoading();
        });
    }
  };
  return (
    <>
      <div>
        <h1 className="mb-3 text-2xl font-bold text-center">
          {props?.detail ? "Edit Grade" : "Add Grade"}
        </h1>
        <form onSubmit={gradeForm.handleSubmit(onSubmit)}>
        
          <CustomInput
            {...gradeForm}
            label="grade_name"
            options={{
              required: "Grade Name is required",
            }}
            placeholder="Grade Name"
          />
          <CustomTextArea
            {...gradeForm}
            label="description"
            options={{
              required: "Course Description is required",
            }}
            placeholder="Description"
          />

          {/* {!props.bankDetail && */}
          <CustomButton
            type="submit"
            text={props?.detail ? "Edit Grade" : "Add Grade"}
          />
          {/* {props.bankDetail && */}
        </form>
      </div>
    </>
  );
};

export default GradeAdd;
