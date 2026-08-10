import { AxiosError } from "axios";
import { FormInstance, message, notification } from "antd";

export interface ApiErrorModel {
  error: {
    details: {
      [key: string]: string[];
    };
  };
}

const useHandleError = () => {
  const handleError = (
    error: AxiosError<ApiErrorModel>,
    transferForm: FormInstance<any>
  ) => {
    if (!error.response?.status) {
      message.error("Connection Failed. Please Try again");
    } else if (error.response?.status == 400) {
      const errors = error.response?.data.error.details;
      for (const err in errors) {
        if (err == "non_field_errors") {
          transferForm.setFields([
            {
              errors: errors[err],
              name: ["root"],
            },
          ]);
        } else {
          transferForm.setFields([
            {
              errors: errors[err],
              name: [err],
            },
          ]);
        }
      }
    }
  };

  const notifyError = (error: AxiosError<ApiErrorModel>) => {
    const errors = error.response?.data?.error?.details;
    console.log("errors:->>>>>", errors);

    if (Array.isArray(errors)) {
      for (let error of errors) {
        message.error(error);
      }
    } else if (typeof error === "object") {
      for (let error in errors) {
        if (error == "non_field_errors") {
          message.error(errors[error]);
        }
      }
    } else {
      const err = errors as unknown as any;
      message.error(err.detail);
    }
  };

  return { handleError, notifyError };
};

export default useHandleError;
