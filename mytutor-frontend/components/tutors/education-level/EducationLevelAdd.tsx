import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import CustomInput from "../../customs/custom-input/CustomInput";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import useTranslation from "../../../utils/translation";
import useLoading from "../../customs/loading/LoadingHook";
import { useEffect, useState } from "react";
import { SelectItem } from "../../../types/MenuItems";
import { SubmitHandler, useForm } from "react-hook-form";
import useEducationLevelService, { EducationLevel } from "./EducationLevelService";
import useCategoryService from "../../courses/category/CategoryService";
import CustomButton from "../../customs/custom-button/CustomButton";
import { message } from "antd";
interface Props {
  getEducationLevel: () => void;
  cancel: () => void;
  detail?: EducationLevel;
}
const EducationLevelAdd = (props: Props) => {
  const educationlevelForm = useForm<EducationLevel>();
  const [categories, setCategories] = useState<SelectItem<string>[]>([]);
  const loading = useLoading();
  const categoryService = useCategoryService();
  const educationlevelService = useEducationLevelService();

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
      educationlevelForm.reset(props.detail);
    }
  }, []);

  const onSubmit: SubmitHandler<EducationLevel> = (data: EducationLevel) => {
    loading.startLoading();
    if (data.id) {
      educationlevelService
        .updateEducationLevel(data.id, data)
        .then((value) => {
          if (value) {
            props.getEducationLevel();
            educationlevelForm.reset();
          }
          loading.stopLoading();
          props.cancel();
          message.success("Successfully updated!");
        })
        .catch((error) => {
          loading.stopLoading();
        });
    } else {
      educationlevelService
        .addEducationLevel(data)
        .then((value) => {
          if (value) {
            props.getEducationLevel();
            educationlevelForm.reset();
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
          {props?.detail ? "Edit EducationLevel" : "Add EducationLevel"}
        </h1>
        <form onSubmit={educationlevelForm.handleSubmit(onSubmit)}>
         
          <CustomInput
            {...educationlevelForm}
            label="educationlevel_name"
            options={{
              required: "EducationLevel Name is required",
            }}
            placeholder="EducationLevel Name"
          />
          <CustomTextArea
            {...educationlevelForm}
            label="description"
            options={{
              required: "Course Description is required",
            }}
            placeholder="Description"
          />

          {/* {!props.bankDetail && */}
          <CustomButton
            type="submit"
            text={props?.detail ? "Edit EducationLevel" : "Add EducationLevel"}
          />
          {/* {props.bankDetail && */}
        </form>
      </div>
    </>
  );
};

export default EducationLevelAdd;
