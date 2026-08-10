import useChapterService from "./ChapterService";
import { Chapter } from "../../../types/Course";
import useTranslation from "../../../utils/translation";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import useLoading from "../../customs/loading/LoadingHook";
import CustomCard from "../../customs/custom-card/CustomCard";
import Loading from "../../customs/loading/Loading";
import CustomInput from "../../customs/custom-input/CustomInput";
import CustomButton from "../../customs/custom-button/CustomButton";
import { message } from "antd";

interface ChapterAddProps {
  course: string;
  reload: () => void;
  isEdit: boolean;
  cancel?: () => void;
  chapterData: any;
}

function ChapterAdd({
  course,
  reload,
  isEdit,
  cancel,
  chapterData,
}: ChapterAddProps) {
  const chapterService = useChapterService();
  const loading = useLoading();

  const { translate } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Chapter>();
  const cancelEdit = () => {
    reset({ id: "", chapter_name: "", chapter_title: "", course: "" });
    cancel?.();
  };
  useEffect(() => {
    if (isEdit) {
      reset(chapterData);
    }
  }, [chapterData?.id]);
  const onSubmit: SubmitHandler<Chapter> = (data) => {
    loading.startLoading();
    if (isEdit) {
      chapterService
        .editChapter(data)
        .then((res: any) => {
          cancel?.();
          reload();
          message.success("Chapter is Updated");
          reset();
          loading.stopLoading();
        })
        .catch((error: any) => {
          message.warning(error.message);
          loading.stopLoading();
        });
    } else {
      chapterService
        .addChapter({ ...data, course })
        .then((value) => {
          cancel?.();
          reload();
          message.success("Chapter is added");
          reset();
          loading.stopLoading();
        })
        .catch((error) => {
          message.warning(error.message);
          loading.stopLoading();
        });
    }
  };

  return (
    <>
      <CustomCard className="relative">
        <Loading {...loading} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            placeholder={translate("name")}
            register={register}
            label="chapter_name"
            options={{ required: "Chapter Name is required" }}
            error={errors.chapter_name}
          />
          <CustomInput
            placeholder={translate("title")}
            register={register}
            label="chapter_title"
            options={{ required: "Chapter Title is required" }}
            error={errors.chapter_title}
          />
          {!isEdit && <CustomButton type="submit" text="Add Chapter" />}
          {isEdit && <CustomButton type="submit" text="Edit Chapter" />}
          {isEdit && (
            <CustomButton type="button" text="Cancel" fun={cancelEdit} />
          )}
        </form>
      </CustomCard>
    </>
  );
}

export default ChapterAdd;
