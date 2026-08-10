import { SubmitHandler, useForm } from "react-hook-form";
import { ContentType } from "../../../../types/Enums";
import { FaReceipt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { handleError } from "../../../../utils/api";
import { List, message } from "antd";
import { CoursePaymentType } from "./CoursePayment.model";
import useBankService from "@/components/tutors/bank/BankService";
import { CustomFileUploader } from "@/components/customs/custom-input/CustomFileUploader/CustomFileUploader";
import CustomDropdown from "@/components/customs/custom-input/CustomDropdown";
import CustomInput from "@/components/customs/custom-input/CustomInput";
import CustomButton from "@/components/customs/custom-button/CustomButton";
import useCoursePaymentService from "./useCoursePayment";
import { Bank } from "@/types/BankItem";

interface Props {
  detail?: CoursePaymentType;
  cancel: () => void;
  searchPayment: () => void;
}

const CoursePaymentReceiptAdd = (props: Props) => {
  const paymentRegister = useForm<CoursePaymentType>();
  const bankService = useBankService();
  const paymentService = useCoursePaymentService();
  const [parentLocation, setParentLocation] = useState<any[]>([]);
  const [bankAccount, setBankAccount] = useState<number>();
  const [bankData, setBankData] = useState<any>();

  const onSubmit: SubmitHandler<CoursePaymentType> = (
    data: CoursePaymentType
  ) => {
    paymentService
      .coursepaymentDetailDo(data.id, "add_receipt", data)
      .then((value) => {
        props.cancel();
        message.success("Successfully Payment Add");
        props.searchPayment();
      })
      .catch((error) => {
        handleError(error, paymentRegister);
      });
  };

  const getBank = (search: string) => {
    bankService.getBanks({ search }).then((value) => {
      setBankData(value.data.results);
      setParentLocation(
        value.data.results.map((v) => ({ label: v.bank_name, value: v.id }))
      );
    });
  };

  useEffect(() => {
    paymentRegister.reset({ ...props.detail });
    if (props.detail) {
      setParentLocation([
        { label: props.detail.bank_name, value: props.detail?.bank },
      ]);
    } 
  }, []);
 

  return (
    <>
      <div>
        <form
          onSubmit={paymentRegister.handleSubmit(onSubmit)}
          className="gap-3 sm:flex"
        >
          <div className="sm:w-1/2">
            <CustomFileUploader
              fileType={ContentType.IMAGE}
              file_id="payment_receipt"
              label="payment_receipt"
              placeholder="Payment Receipt"
              options={{
                required: "Receipt image  is required",
              }}
              imagePlaceHolder={
                <>
                  <p className="ant-upload-drag-icon">
                    <FaReceipt />
                  </p>
                  <p className="ant-upload-text">
                    Click or picture to this area to upload
                  </p>
                </>
              }
              {...paymentRegister}
            />
          </div>
          <div className="flex flex-col justify-center sm:w-1/2">
            <CustomDropdown
              type="select"
              className="w-full "
              label="bank"
              options={{
                required: "Bank is required",
              }}
              isSearchable={true}
              data={parentLocation}
              placeholder="Bank"
              onChange={(e) =>
                setBankAccount(
                  bankData?.find((val: Bank) => val.id === e.target.value)
                    ?.account_number
                )
              }
              onInputChange={getBank}
              {...paymentRegister}
            />
            <CustomInput
              placeholder="Reference Number"
              label="reference_no"
              options={{
                required: "Bank is required",
              }}
              {...paymentRegister}
            />
            <div className="flex justify-end">
              <CustomButton
                type="submit"
                text="Submit"
                className="px-4 sm:leading-none sm:text-md"
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CoursePaymentReceiptAdd;
