import { UseFormReturn } from "react-hook-form";
import CustomInputError from "../../customs/custom-input-error/CustomInputError";
import Loading from "../../customs/loading/Loading";
import useLoading from "../../customs/loading/LoadingHook";
import CustomInput from "../../customs/custom-input/CustomInput";
import { Attendance } from "../../../types/Attendance";
import { generateUniqueKey } from "@/utils/func_utils";

const AttendanceApproval = (props: {
  cancel?: () => void;
  searchUserPermission?: () => void;
  approvalForm: UseFormReturn<Attendance, any>;
}) => {
  const {approvalForm} = props;

  const loading = useLoading();

  return (
    <>
      <Loading {...loading} />

      <div className="container grid grid-cols-1 mx-auto">
        <form>
          <CustomInputError msg={approvalForm.formState.errors.root?.message} />
            <CustomInput type="text" label='remark' rows={4} placeholder="Remark" {...approvalForm}/>
        </form>
      </div>
    </>
  );
};

export default AttendanceApproval;
