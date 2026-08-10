import { FieldError, FieldValues } from "react-hook-form";
import { InputProps } from "../../../types/InputTypeProp";
import CustomInputError from "../custom-input-error/CustomInputError";
import { FaInfo, FaInfoCircle, FaStarOfLife } from "react-icons/fa";
import { generateUniqueKey } from "@/utils/func_utils";
import { InfoCircleFilled, InfoOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { BiInfoCircle } from "react-icons/bi";
import { BsInfoCircle } from "react-icons/bs";

function CustomInput<T extends FieldValues>({
  type = "text",
  title,
  tooltipdescription,
  onValueChange,
  val,
  label,
  placeholder,
  register,
  options,
  error,
  formState,
  className = "",
  key = null,
  setValue,
  getValues,
  isDisable = false,
}: InputProps<T>) {
  const handleChangeCapture = (value: any) => {
    setValue && setValue(label, value);
  };
  error = error ? error : (formState?.errors[label] as FieldError);
  const { onChange } = register(label, options);

  const handleOnChange = (e: any) => {
    onValueChange && onValueChange(e);
    onChange(e);
  };
  return (
    <div
      className={`${className ? className : ""} `}
      key={key + generateUniqueKey()}
    >
      <label
        className="flex gap-1 text-xs text-slate-500"
        htmlFor={label}
      >
        {options?.required && <FaStarOfLife style={{ width: "7px" }} />}
        <span className="flex gap-1 items-baseline">
          {placeholder}
          {tooltipdescription && (
            <Tooltip title={tooltipdescription}>
              <FaInfoCircle size={12} />
            </Tooltip>
          )}
        </span>
      </label>
      <input
        id={label}
        type={type}
        {...register(label, options)}
        placeholder={placeholder}
        value={val}
        disabled={isDisable}
        capture={true}
        onChangeCapture={(e) => handleChangeCapture(e.currentTarget.value)}
        onChange={handleOnChange}
        className={
          "h-10 w-full pl-2 pr-6 text-base  transition-all duration-300 ease-in border-2 border-solid focus:outline-custom_orange-900 focus:border-custom_orange-800  rounded-xl bg-white"
        }
        title={tooltipdescription}
      />
      {error && <CustomInputError msg={error?.message} />}
    </div>
  );
}
export default CustomInput;
