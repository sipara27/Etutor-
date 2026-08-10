import CustomInput from "../../customs/custom-input/CustomInput";
import CustomGroupInput from "../../customs/custom-input/CustomGroupInput";
import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import { useEffect, useState } from "react";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import CustomButton from "../../customs/custom-button/CustomButton";
import CustomText from "../../customs/custom-text/CustomText";
import useCategoryService from "../category/CategoryService";
import useCourseService from "./CourseService";
import { Course } from "../../../types/Course";
import useLoading from "../../customs/loading/LoadingHook";
import Loading from "../../customs/loading/Loading";
import useTranslation from "../../../utils/translation";
import { SubmitHandler, useForm } from "react-hook-form";
import { SelectItem } from "../../../types/MenuItems";
import useFileService from "../../commons/file/FileService";
import { courseLevel, courseType, courseTypeEnum } from "../../../types/Enums";
import CustomFileInput from "@/components/customs/custom-input/CustomFileInput";
import { message } from "antd";

interface Props {
  courseData?: Course;
  searchCourses?: () => void;
  cancel?: () => void;
}

function CourseAdd(props: Props) {
  const [categories, setCategories] = useState<SelectItem<string>[]>([]);
  const {
    register,
    setError,
    control,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Course>();
  const courseService = useCourseService();
  const loading = useLoading();
  const { translate } = useTranslation();
  const categoryService = useCategoryService();
  const fileService = useFileService();

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
  }, []);

  useEffect(() => {
    props.courseData ? reset({ ...props.courseData }) : reset();
  }, [props.courseData]);

  const onSubmit: SubmitHandler<Course> = (data) => {
    loading.startLoading();
    const formData = new FormData();
    if ((data.course_image[0] as File)?.name !== undefined) {
      formData.append(
        "url",
        data.course_image[0] as Blob,
        (data.course_image[0] as File)?.name
      );

      formData.append("file_type", "101");
    }

    if ((data.course_image[0] as File)?.name !== undefined) {
      fileService
        .addFile(formData)
        .then(({ data: value }) => {
          loading.stopLoading();
          data.course_image = value.url;
          if (data.course_type === courseTypeEnum.FREE) {
            data.course_price = 0;
          }
          if (props.courseData?.id != null) {
            courseService
              .editCourse(data)
              .then(({ data: value }) => {
                loading.stopLoading();
                // router.push(`${value.id}`);
                props.cancel?.();
                props?.searchCourses?.();

                message.info("Sucessfully updated!");
              })
              .catch((error) => {
                loading.stopLoading();
                const errors = error.response.data.error.details;
                for (const err in errors) {
                  if (err === "non_field_errors") {
                    setError("root", { message: errors[err] });
                  } else {
                    setError(err as keyof Course, { message: errors[err] });
                  }
                }
                loading.stopLoading();
              });
          } else {
            courseService
              .addCourse(data)
              .then(({ data: value }) => {
                loading.stopLoading();
                props?.searchCourses?.();
                props.cancel?.();
                message.info("Sucessfully added!");
              })
              .catch((error) => {
                loading.stopLoading();
                const errors = error.response.data.error.details;
                for (const err in errors) {
                  if (err === "non_field_errors") {
                    setError("root", { message: errors[err] });
                  } else {
                    setError(err as keyof Course, { message: errors[err] });
                  }
                }
                loading.stopLoading();
              });
          }
        })
        .catch(() => {
          loading.stopLoading();
        });
    } else {
      courseService
        .editCourse(data)
        .then(({ data: value }) => {
          loading.stopLoading();
          props.cancel?.();
          props?.searchCourses?.();
          message.info("Sucessfully updated!");
        })
        .catch((error) => {
          loading.stopLoading();
          const errors = error.response.data.error.details;
          for (const err in errors) {
            if (err === "non_field_errors") {
              setError("root", { message: errors[err] });
            } else {
              setError(err as keyof Course, { message: errors[err] });
            }
          }
          loading.stopLoading();
        });
    }
  };

  const cancelEdit = () => {
    reset();
    props?.cancel?.();
  };

  return (
    <div className="relative">
      <Loading {...loading} />
      <h1 className="text-center text-4xl my-2">
        {props.courseData?.id ? "Edit" : "Add"} <CustomText text="Course" />
      </h1>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-7 flex flex-wrap">
            <div className="w-full lg:w-1/2 px-3">
              <CustomInput
                register={register}
                label="name"
                error={errors.name}
                options={{
                  required: "Course Name is required",
                }}
                placeholder="Course Name"
              />
            </div>
            <div className="w-full lg:w-1/2 px-3">
              <CustomDropdown
                placeholder="Category"
                data={categories}
                register={register}
                control={control}
                multiple
                label="category"
                options={{
                  required: "Category is required",
                }}
                onInputChange={(value) => getCategoryData(value)}
                isSearchable={true}
                error={errors.categorys}
              />
            </div>
            <div className="w-full lg:w-1/2 px-3">
              <CustomDropdown
                placeholder="Level"
                id="id"
                val="name"
                data={courseLevel}
                register={register}
                label="course_level"
                options={{
                  required: "Course Level is required",
                }}
                control={control}
                isSearchable={false}
                error={errors.course_level}
              />
            </div>
            <div className="w-full lg:w-1/2 px-3">
              <CustomDropdown
                placeholder="Type"
                data={courseType}
                control={control}
                register={register}
                label="course_type"
                options={{
                  required: "Course Type is required",
                }}
                isSearchable={false}
                error={errors.course_type}
              />
            </div>

            {getValues("course_type") === courseTypeEnum.PREMIUM && (
              <div className="w-full lg:w-1/2 px-3">
                <CustomGroupInput
                  register={register}
                  label="course_price"
                  error={errors.course_price}
                  options={{
                    required: "Course Price is required",
                  }}
                  prefix={translate("price")}
                  placeholder=""
                />
              </div>
            )}

            <div className="w-full lg:w-1/2 px-3">
              <CustomTextArea
                register={register}
                label="description"
                error={errors.description}
                options={{
                  required: "Course Description is required",
                }}
                placeholder="Description"
              />
            </div>
            <div className="w-full lg:w-1/2 px-3">
              <CustomGroupInput
                register={register}
                label="course_code"
                error={errors.course_code}
                options={{
                  required: "Course Code is required",
                }}
                prefix={translate("course_code")}
                placeholder="Course Code"
              />
            </div>
            <div className="w-full  h-64 lg:w-1/2 px-3">
              <CustomFileInput
                register={register}
                fileType={101}
                label="course_image"
                options={{
                  required: "Course Image is required",
                }}
                placeholder="Course Image"
                val={props.courseData?.id ? getValues("course_image") : null}
                error={errors?.course_image}
              />
            </div>
          </div>
          {props.courseData?.id === undefined && (
            <div className="w-full lg:w-1/2 px-3">
              <CustomButton type="submit" text="Add Course" />
            </div>
          )}
          {props.courseData?.id && (
            <div className="w-full lg:w-1/2 px-3">
              <CustomButton type="submit" text="Edit Course" />
            </div>
          )}
          {props.courseData?.id && (
            <div className="w-full lg:w-1/2 px-3">
              <CustomButton type="button" text="Cancel" fun={cancelEdit} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CourseAdd;
