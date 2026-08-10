"use client"
import { Controller, FieldError, FieldValues } from "react-hook-form";
import { InputProps } from "../../../types/InputTypeProp";
import CustomInputError from "../custom-input-error/CustomInputError";
import Select, { InputActionMeta } from 'react-select'
import { useEffect, useState } from "react";
import { SelectItem } from "../../../types/MenuItems";
import { FaInfoCircle, FaStarOfLife } from "react-icons/fa";
import { generateUniqueKey } from "@/utils/func_utils";
import { Tooltip } from "antd";

function CustomDropdown<T extends FieldValues>({label, multiple=false, val, data = [],tooltipdescription, formState, isSearchable, placeholder, control = undefined, options, prefix, onInputChange, onValueChange, error, className ='', isClearable = true, isDisable}: InputProps<T>) {
  error = error ? error : (formState?.errors[label] as FieldError)
  const [values, setValues] = useState<SelectItem<string|number>[]>([]) 
  const handleInputChange = (newValue: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === 'input-change' || actionMeta.action === 'menu-close'){
      onInputChange && onInputChange(newValue)
    }
  }

  const customStyles = {
    option: (provided:any, state:any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#36a2eb' : state.isFocused ? '#d3d3d3' : '#fff',
      color: state.isSelected ? '#fff' : '#333',
      padding: 8,
    }),
  }

  useEffect(() => {
    multiple &&  setValues(Array.from(new Set([...data , ...values])))
  },[data])

  const getValues = (value: any) => {
    return value ? ((value instanceof Array) ?  value.map(val => [...data ,...values].find(dat => dat.value === val) || {label: val, value:val}) || null: data?.find(dat => dat.value === value)) : null
  }

  return (
    <div className={`${className?className:""}`}>
    <label className="flex gap-1 text-xs text-slate-500 " htmlFor={label}>
      {options?.required&&<FaStarOfLife style={{width:"7px",}} />}
      {placeholder}
          {tooltipdescription && (
            <Tooltip title={tooltipdescription}>
              <FaInfoCircle size={12} />
            </Tooltip>
          )}
        
        </label>
    <Controller
        name={label}
        control={control}
        rules={options}
        render={({ field : {ref, value=val, onChange}}) => {
        return <Select
            id={label}
            ref={ref}
            isMulti={multiple}
            className={className+"control-dropdown  border-2 border-solid rounded-xl focus:outline-custom_orange-900 focus:border-custom_orange-800"}
            styles={customStyles}
            {...{value:getValues(value)}}
            onChange={val => {
              if(val instanceof Array){
                onValueChange?.(val.map(a => a?.value));
                return onChange(val.map(a => a?.value)) 
              } else {
                onValueChange?.(val?.value); 
                return onChange(val?.value)}
              }
            }
            isClearable={isClearable}
            isSearchable={isSearchable}
            onInputChange={handleInputChange}
            onFocus={() =>  onInputChange?.("")}
            options={data}
            isDisabled={isDisable}
            placeholder={placeholder}
            />
        }}
    />
<CustomInputError msg={error?.message}/>
</div>
  );
}

export default CustomDropdown;