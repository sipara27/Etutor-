import React, { useEffect, useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import useScreenSize from "./useScreenSize";
import { componentType } from "../../../types/Enums";
import { toggleList } from "../../../utils/array";
import { SearchComponentProps } from "./search";
import { FiSearch } from "react-icons/fi";
import { Dropdown, Select, Switch } from "antd";
import { FilterOutlined } from "@ant-design/icons";
type propsType = {
  components: SearchComponentProps[];
  filteredData: any;
  handleChange: (key: string, value: any) => void;
};

const SearchBar = (props: propsType) => {
  const { isMobile } = useScreenSize();
  const [timerId, setTimerId] = useState<any>(null);

  useEffect(() => {
    // Clean up the timer when the component is unmounted or when inputValue changes
   
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const handleInputChange = (
    prop: SearchComponentProps,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    // Clear the existing timer if any
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set a new timer
    const newTimerId = setTimeout(() => {
      props.handleChange(prop.key, newValue);
    }, 1000); // 1 second of inactivity

    newTimerId && setTimerId(newTimerId);
  };

  const addTextComponent = (prop: SearchComponentProps) => {
    return (
      <div
        className={`relative p-0 mt-2 ${
          props.components.length === 1 ? "w-full" : "w-[150px]"
        } sm:w-60`}
        key={prop.key}
      >
        <button className="absolute top-0 right-0 z-10 w-6 h-10 text-base text-center bg-transparent rounded-lg bg text-custom_orange-900 cursor:none">
          <i>
            <FiSearch></FiSearch>
          </i>
        </button>
        <input
          placeholder={prop.placeholder}
          defaultValue={props.filteredData[prop.key] ?? ""}
          onChange={(e) => {
            handleInputChange(prop, e);
          }}
          className="w-full h-10 pl-2 pr-6 text-base transition-all duration-300 ease-in bg-white border border-solid text-custom_black-200 focus:outline-custom_orange-900 border-custom_orange-100 rounded-xl"
        />
      </div>
    );
  };

  const addDatePicker = (prop: SearchComponentProps) => {
    return (
      <div className="mt-2 w-[150px] sm:w-60">
        <input
          type="date"
          className="w-full h-10 pl-2 pr-6 text-base transition-all duration-300 ease-in bg-white border border-solid text-custom_black-200 focus:outline-custom_orange-900 border-custom_orange-100 rounded-xl"
          key={prop.key}
          placeholder={prop.placeholder}
          onChange={(e) => props.handleChange(prop.key, e.target.value)}
        />
      </div>
    );
  };

  const addSearchInput = (prop: SearchComponentProps) => {
    return (
      <Select
        key={prop.key}
        className=" flex items-center bg-gray-F7 h-10 w-[150px] mt-2 sm:w-60"
        placeholder={prop.placeholder}
        options={prop.options}
        allowClear={!prop.disableClear}
        onClear={() => props.handleChange(prop.key, undefined)}
        value={props.filteredData[prop.key]}
        onSearch={prop.search}
        showSearch
        onFocus={() => prop.search?.("")}
        onChange={(e) => props.handleChange(prop.key, e)}
      />
    );
  };

  const addToggleInput = (prop: SearchComponentProps) => {
    return (
      <div
        className="flex items-center gap-1 p-1 border-2 border-gray-300 border-solid rounded-md "
        key={prop.key}
      >
        <Switch
          checkedChildren="Yes"
          unCheckedChildren="No"
          onChange={(e) => props.handleChange(prop.key, e)}
        />
        <div className="text-gray-600">{prop.placeholder}</div>
      </div>
    );
  };

  const addDropDownInput = (prop: SearchComponentProps) => {
    return (
      <Select
        key={prop.key}
        className=" flex items-center bg-gray-F7 w-[150px] h-10 mt-2 sm:w-60"
        placeholder={prop.placeholder}
        options={prop.options}
        allowClear={!prop.disableClear}
        onClear={() => props.handleChange(prop.key, undefined)}
        value={props.filteredData[prop.key]}
        showSearch={!!prop.search}
        onFocus={() => prop.search?.("")}
        onChange={(e) => props.handleChange(prop.key, e)}
        mode={prop.ismultiple ? "multiple" : undefined}
      />
    );
  };

  const compFunction = {
    [componentType.TEXT]: addTextComponent,
    [componentType.DROPDOWN]: addDropDownInput,
    [componentType.DATE]: addDatePicker,
    [componentType.SEARCH]: addSearchInput,
    [componentType.TOGGLE]: addToggleInput,
  };

  const [elements, setElements] = useState<JSX.Element[]>();

  const [visibleComponents, setVisibleComponents] = useState(
    props.components?.slice(0, 3).map((value) => value.key)
  );
  const [searchOptions, setSearchOptions] = useState<any>([]);

  const toggle = (key: string) => {
    setVisibleComponents(toggleList(visibleComponents, key));
  };

  const onClose = (key: string) => {
    toggle(key);
    props.handleChange(key, undefined);
  };

  const mobileView = (comp: SearchComponentProps) => (
    <div className="relative w-fit">
      <div className="w-[98%]">{compFunction[comp.type](comp)}</div>
    </div>
  );

  const isVisible = (comp: SearchComponentProps) =>
    visibleComponents.some((value) => value === comp.key && !comp.hidden);

  const optionTemplate = (value: SearchComponentProps) => ({
    label: value.placeholder,
    value: value.key,
    onClick: () => toggle(value.key),
  });

  const mobElements = () => {
    setSearchOptions(
      props.components.filter((comp) => !isVisible(comp)).map(optionTemplate)
    );
    return props?.components.filter(isVisible).map(mobileView);
  };

  useEffect(() => {
    let els = isMobile
      ? mobElements()
      : props.components
          .filter((comp) => !comp.hidden)
          .map((component, i) =>
            compFunction[component.type]({ ...component })
          );
    setElements(els);
  }, [props?.components, visibleComponents, isMobile]);

  return (
    <div className="flex gap-2 py-1 mx-2 bg-transparent rounded-lg sm:mx-0">
      <div className="flex flex-row flex-wrap items-center justify-start w-full gap-x-2 sm:gap-x-4 ">
        {elements}
      </div>
    </div>
  );
};

export default SearchBar;
