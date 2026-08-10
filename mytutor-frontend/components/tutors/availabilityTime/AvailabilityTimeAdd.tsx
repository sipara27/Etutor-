import CustomInput from "../../customs/custom-input/CustomInput";
import { useEffect } from "react";
import CustomButton from "../../customs/custom-button/CustomButton";
import CustomText from "../../customs/custom-text/CustomText";
import { AvailablityTime } from "../../../types/AvailablityItem";
import useLoading from "../../customs/loading/LoadingHook";
import useTranslation from "../../../utils/translation";
import { SubmitHandler, useForm } from "react-hook-form";
import useAvailablityTimeService from "./AvaliablityService";
import SmallLoading from "../../customs/loading/SmallLoading";
import Loading from "../../customs/loading/Loading";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import CustomDropdown from "@/components/customs/custom-input/CustomDropdown";
import { Days } from "../../../types/Enums";

interface Props {
  searchAvailablityTimes: () => void;
  AvailablityTimeDetail?: AvailablityTime;
  cancel?: () => void;
}

function AvailablityTimeAdd(props: Props) {
  const AvailablityTimeForm = useForm<AvailablityTime>();
  const AvailablityTimeService = useAvailablityTimeService();
  const loading = useLoading();
  const { translate } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<AvailablityTime>({
    defaultValues: {
     
    },
  });

  const router = useRouter();

  const resetVal = () => {
    AvailablityTimeForm.reset({
      start_time: "",
      end_time: "",
      day:0
    });
  };

  useEffect(() => {
    if (props?.AvailablityTimeDetail) {
      AvailablityTimeForm.reset({ ...props.AvailablityTimeDetail });
    } else {
      resetVal();
    }
  }, [props.AvailablityTimeDetail, AvailablityTimeForm.reset]);

  const onSubmit: SubmitHandler<AvailablityTime> = (data) => {
    loading.startLoading();
    if (props.AvailablityTimeDetail) {
      AvailablityTimeService
        .editAvailablityTime(data)
        .then(({ data: value }) => {
          loading.stopLoading();
          props.searchAvailablityTimes();
          props.cancel?.();
          resetVal();
          message.success("Successfully updated!");
          // router.push(`/dashboard/AvailablityTime_list`);
        })
        .catch((error) => {
          loading.stopLoading();
          handleError(error);
          loading.stopLoading();
        });
    } else {
      AvailablityTimeService
        .addAvailablityTime(data)
        .then(({ data: value }) => {
          loading.stopLoading();
          props.searchAvailablityTimes();
          props.cancel?.();
          resetVal();
          message.success("Successfully added");
          // router.push(`/dashboard/AvailablityTime_list`);
        })
        .catch((error) => {
          loading.stopLoading();
          handleError(error);
          loading.stopLoading();
        });
    }
  };
  const handleError = (error: any) => {
    const errors = error.response.data.error.details;
    for (const err in errors) {
      if (err === "non_field_errors") {
        AvailablityTimeForm.setError("root", { message: errors[err] });
      } else {
        AvailablityTimeForm.setError(err as keyof AvailablityTime, { message: errors[err] });
      }
    }
  };

  return (
    <div className="relative">
      <Loading {...loading} />
      <h1 className="my-2 text-2xl font-bold text-left ml-7 ">
        {props?.AvailablityTimeDetail ? "Edit" : "Add"} <CustomText text="AvailablityTime" />
      </h1>
      <div className="justify-center md:flex-col md:mr-10">
          <div className="mt-5 text-slate-400">
            <h1>*Please Add Availability below</h1>
          </div>
        
            <div
          
              className="flex-wrap items-center justify-between w-full md:flex gap-x-2 md:flex-nowrap md:gap-4"
            >
               <form onSubmit={handleSubmit(onSubmit)}>
              <CustomDropdown
                type="number"
                register={register}
                label="day"
                options={{
                  required: "Day is required",
                  validate: {},
                }}
                error={errors.day}
                
                control={control}
                data={Days}
                placeholder="Day....."
              />
              <CustomInput
                type="time"
                register={register}
                 label="start_time"
                 error={errors.start_time}
                 options={{
                required: "start time  is required",
              }}
                placeholder="Start Time"
              />
              <CustomInput
                type="time"
                register={register}
                 label="end_time"
                 error={errors.end_time}
                 
                options={{
                  required: "End Time is required",
                  validate: {},
                }}
                placeholder="End Time"
              />
              
          {!props.AvailablityTimeDetail && (
              <CustomButton type="submit" text="Add " />
            )}
            {props.AvailablityTimeDetail && (
              <CustomButton
                type="submit"
                text="Edit "
                is_loading={<SmallLoading {...loading} />}
              />
            )}
              </form>
            </div>
     
         
         
        </div>
    </div>
  );
}

export default AvailablityTimeAdd;
