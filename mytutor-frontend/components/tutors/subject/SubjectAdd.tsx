import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import CustomInput from "../../customs/custom-input/CustomInput";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import useTranslation from "../../../utils/translation";
import useLoading from "../../customs/loading/LoadingHook";
import { useEffect, useState } from "react";
import { SelectItem } from "../../../types/MenuItems";
import { SubmitHandler, useForm } from "react-hook-form";
import useSubjectService, { Subject } from "./SubjectService";
import useCategoryService from "../../courses/category/CategoryService";
import CustomButton from "../../customs/custom-button/CustomButton";
import { message } from "antd";
interface Props {
  getSubject: () => void;
  cancel: () => void;
  detail?: Subject;
}
const SubjectAdd = (props: Props) => {
  const subjectForm = useForm<Subject>();
  const [categories, setCategories] = useState<SelectItem<string>[]>([]);
  const loading = useLoading();
  const categoryService = useCategoryService();
  const subjectService = useSubjectService();

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
      subjectForm.reset(props.detail);
    }
  }, []);

  const onSubmit: SubmitHandler<Subject> = (data: Subject) => {
    loading.startLoading();
    if (data.id) {
      subjectService
        .updateSubject(data.id, data)
        .then((value) => {
          if (value) {
            props.getSubject();
            subjectForm.reset();
          }
          loading.stopLoading();
          props.cancel();
          message.success("Successfully updated!");
        })
        .catch((error) => {
          loading.stopLoading();
        });
    } else {
      subjectService
        .addSubject(data)
        .then((value) => {
          if (value) {
            props.getSubject();
            subjectForm.reset();
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
          {props?.detail ? "Edit Subject" : "Add Subject"}
        </h1>
        <form onSubmit={subjectForm.handleSubmit(onSubmit)}>
          <CustomDropdown
            placeholder="Category"
            data={categories}
            multiple
            label="category"
            options={{
              required: "Category is required",
            }}
            onInputChange={(value) => getCategoryData(value)}
            isSearchable={true}
            {...subjectForm}
          />
          <CustomInput
            {...subjectForm}
            label="subject_name"
            options={{
              required: "Subject Name is required",
            }}
            placeholder="Subject Name"
          />
          <CustomTextArea
            {...subjectForm}
            label="description"
            options={{
              required: "Course Description is required",
            }}
            placeholder="Description"
          />

          {/* {!props.bankDetail && */}
          <CustomButton
            type="submit"
            text={props?.detail ? "Edit Subject" : "Add Subject"}
          />
          {/* {props.bankDetail && */}
        </form>
      </div>
    </>
  );
};

export default SubjectAdd;
