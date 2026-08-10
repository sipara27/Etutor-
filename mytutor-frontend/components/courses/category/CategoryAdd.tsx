import CustomInput from "../../customs/custom-input/CustomInput";
import { useEffect } from "react";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import CustomButton from "../../customs/custom-button/CustomButton";
import CustomText from "../../customs/custom-text/CustomText";
import { Category } from "../../../types/Category";
import useCategoryService from "./CategoryService";
import { SubmitHandler, useForm } from "react-hook-form";
import useLoading from "../../customs/loading/LoadingHook";
import { message } from "antd";

function CategoryAdd(prop: any) {
  const { setLoad } = prop;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Category>();
  const categoryService = useCategoryService();
  const loading = useLoading();

  useEffect(() => {
    prop.categoryData?.id ? reset(prop.categoryData) : cancelEdit();
  }, [prop.categoryData, reset]);

  const onSubmit: SubmitHandler<Category> = (data) => {
    loading.startLoading();

    if (prop.categoryData?.id) {
      categoryService.editCategory(data).then(({ data: value }) => {
        reset({ id: "", category_name: "", description: "" });
        prop.setCategoryData({});
        prop.cancel?.();
        loading.stopLoading();
        message.info("Sucessfully updated!");
      });
    } else {
      categoryService.addCategory(data).then(({ data: value }) => {
        prop.cancel?.();
        reset({ id: "", category_name: "", description: "" });
        loading.stopLoading();
        setLoad?.(true);
        message.info("Sucessfully updated!");
      });
    }
  };
  const cancelEdit = () => {
    reset({ id: "", category_name: "", description: "" });
    // prop.setCategoryData({})
  };

  return (
    <>
      <h1 className="text-center text-2xl py-2">
        Add <CustomText text="Category" />
      </h1>
      <div className="container mx-auto">
        {/* grid grid-cols-1 mb-10"> */}

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            register={register}
            label="category_name"
            error={errors.category_name}
            options={{
              required: "Category Name is required",
            }}
            placeholder="Category Name"
          />
          <CustomTextArea
            register={register}
            label="description"
            error={errors.description}
            options={{
              required: "Category Description is required",
            }}
            placeholder="Description"
          />
          {!prop.categoryData?.id && (
            <CustomButton type="submit" text="Add Category" />
          )}
          {prop.categoryData?.id && (
            <CustomButton type="submit" text="Edit Category" />
          )}
        </form>
      </div>
    </>
  );
}

export default CategoryAdd;
