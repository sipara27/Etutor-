import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import useTutorService from "./ToturService";
import useLoading from "../../customs/loading/LoadingHook";
import CustomTextArea from "../../customs/custom-input/CustomTextArea";
import CustomInput from "../../customs/custom-input/CustomInput";
import CustomDropdown from "../../customs/custom-input/CustomDropdown";
import { ActionStatusName, Days, daysOption, location_type, tutorTypeOptions } from "../../../types/Enums";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { SelectItem } from "../../../types/MenuItems";
import { UserIdContext } from "../../account/auth/UserPages";
import { AvailableTime, Tutor, Location } from "./TutorInfoModel";
import CustomButton from "../../customs/custom-button/CustomButton";
import SmallLoading from "../../customs/loading/SmallLoading";
import { AppState } from "@/state/store/store";
import { useSelector } from "react-redux";
import useSubjectService, { Subject } from "../subject/SubjectService";
import { Avatar, Button, Dropdown, message, Popconfirm, Table, Tag } from "antd";

import { usePathname } from "next/navigation";
import { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import Link from "next/link";
import { generateUniqueKey } from "@/utils/func_utils";
import { getLabelByValue } from "@/utils/array";
import { formatDateTime } from "@/utils/date";
import CustomTable from "@/components/commons/Table/Table";
import useGradeService, { Grade } from "../grade/GradeService";
interface Props {
  id?: string;
  searchDatas: () => void;
  itemDetail?: Tutor;
  cancel?: () => void;
}

const TutorAdd = (props: Props) => {
  const [availablityTimes, setAvailablityTimes] = useState<AvailableTime[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectItem<string>[]>(
    []
  );
  const [preferredSubjectOptions, setPreferredSubjectOptions] = useState<
    SelectItem<string>[]
  >([]);
  const [preferredGradeOptions, setPreferredGradeOptions] = useState<
  SelectItem<string>[]
>([]);
  const [zoneOptions, setZoneOptions] = useState<SelectItem<string>[]>([]);
  const [regionOptions, setRegionOptions] = useState<SelectItem<string>[]>([]);
  const { registeredUserId } = useContext(UserIdContext);
  const user = useSelector((state: AppState) => state.user);
  const loading = useLoading();
  const tutorService = useTutorService();
  const subjectService = useSubjectService();
  const gradeService = useGradeService()
 
  const pathname = usePathname()
  const currentPath = pathname;
  const [tutorsData,setTutorData]=useState<Tutor[]>([])

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm<Tutor>({
    defaultValues: {
      availabilty_times: [{ day: 0, start_time: "", end_time: "" }],
      is_active:false
    },
  });
  const { fields, remove, append } = useFieldArray({
    name: "availabilty_times",
    control,
  });

  useEffect(() => {
    getPreferredSubjects();
    getGrades();
    if (props?.itemDetail) {
      setAvailablityTimes(props?.itemDetail.availabilty_times);
      reset({ ...props.itemDetail });
      setRegionOptions([
        {
          label: props.itemDetail.region_name,
          value: props.itemDetail.region,
        },
      ]);
      setZoneOptions([
        {
          label: props.itemDetail.zone_name,
          value: props.itemDetail.zone,
        },
      ]);
      setLocationOptions([
        {
          label: props.itemDetail.woreda_name,
          value: props.itemDetail.location,
        },
      ]);
    } else {
      resetVal();
      tutorService.getTutors({is_active:true}).then(({data:response})=>{
          if(response.results.length>0){
            reset({ ...response.results[0], id:undefined, availabilty_times:[],
               status:ActionStatusName.RequestSubmitted, is_active:false  });
            setRegionOptions([
              {
                label: response.results[0].region_name,
                value: response.results[0].region,
              },
            ]);
            setZoneOptions([
              {
                label: response.results[0].zone_name,
                value: response.results[0].zone,
              },
            ]);
            setLocationOptions([
              {
                label: response.results[0].woreda_name,
                value: response.results[0].location,
              },
            ]);
          }

        
      }).catch(err=>{

      })
    }
  }, [props.itemDetail, reset]);

  const resetVal = () => {
    reset({});
  };
  useEffect(()=>{
    getTutors()
  },[])
  const getTutors = ()=>{
    tutorService.getTutors().then(({data:response})=>{
      setTutorData(response.results)
      console.log(tutorsData)
   }).catch(err=>{

   })
  }

  const onSubmit: SubmitHandler<Tutor> = (data: Tutor) => {
    loading.startLoading();
    setAvailablityTimes(data.availabilty_times);
    if (!props?.itemDetail) {
      data.tutor = user.id ? user.id : registeredUserId;

      tutorService
        .addTutor(data)
        .then((value) => {
          if (value) {
            props.searchDatas();
            props.cancel?.();
            message.success("Successfully added");
          }
         
          if(currentPath=="/tutor_register"){
            getTutors()
          }
          loading.stopLoading();
        })
        .catch((value) => loading.stopLoading());
    } else {
      tutorService
        .partialUpdateTutorRequest(data.id, data)
        .then((value) => {
          if (value) {
            props.searchDatas();
            props.cancel?.();
            message.success("Successfully added");
          }
          loading.stopLoading();
        })
        .catch((value) => loading.stopLoading());
    }
  };

  const changeT2Num = (time: string) => {
    let [x, y] = time.split(":");
    return Number(x) * 60 + Number(y);
  };
  const isOverape = (a: number, b: number, x: number, y: number) => {
    return Math.max(a, x) <= Math.min(b, y);
  };

  // const onSubmitAvalabilty = (data: AvailableTime, index:number) => {
  //   if (changeT2Num(data.start_time) > changeT2Num(data.end_time)) {
  //     setError(`availabilty_times.${index}.end_time`, { message: "Must greater than start time" })
  //   } else if (availablityTimes.some(value => value.day === data.day &&
  //             isOverape(changeT2Num(value.start_time), changeT2Num(value.end_time),
  //             changeT2Num(data.start_time), changeT2Num(data.end_time))))
  //   {
  //     setError(`availabilty_times.${index}.day`, { message: "There is Overlap in availabilty" })
  //   } else {
  //     reset({
  //         "availabilty_times": []
  //     })
  //     setAvailablityTimes([data, ...availablityTimes])
  //   }
  // };

  // const removeEntry = (data: AvailableTime) => {
  //   setAvailablityTimes(availablityTimes.filter(value => value !==data))
  // }

  const getLocations = (
    search: string,
    location_type: number,
    setLocationOptions: (arg1: SelectItem<string>[]) => void,
    parent?: string
  ) => {
    tutorService
      .getLocations({ search, location_type, parent })
      .then(({ data: value }) => {
        if (value) {
          setLocationOptions(
            value.results.map((val: Location) => ({
              label: val.address,
              value: val.id,
            }))
          );
        }
      });
  };

  const getPreferredSubjects = (search: string = "") => {
    subjectService.getSubjects({ search }).then(({ data: value }) => {
      if (value) {
        setPreferredSubjectOptions(
          value.results.map((val: Subject) => ({
            label: val.subject_name,
            value: val.id,
          }))
        );
      }
    });
  };

  const getGrades = (search: string = "") => {
    gradeService.getGrades({ search }).then(({ data: value }) => {
      if (value) {
        setPreferredGradeOptions(
          value.results.map((val: Grade) => ({
            label: val.grade_name,
            value: val.id,
          }))
        );
      }
    });
  };

  const handleArrayField = (
    field_array:
      | Merge<
          FieldError,
          (Merge<FieldError, FieldErrorsImpl<AvailableTime>> | undefined)[]
        >
      | undefined,
    index: number,
    field: string
  ) => {
    return field_array && field_array[index];
  };



  const tutorsColumns: ColumnsType<Tutor> = [
    {
      title: "Image",
      dataIndex: "profile_picture",
      sorter: false,
      key: "profile_picture",
      render: (_, { profile_picture, id }) => (
        <>
          <div className="flex-col hidden gap-x-4 sm:flex">
            <Link href={`/tutors/${id}`}>
              {profile_picture ? (
                <Avatar src={profile_picture} shape="circle" />
              ) : (
                <Avatar src="/images/profile.png" shape="circle" />
              )}
            </Link>
          </div>
        </>
      ),
    },
    {
      title: "Tutor Name",
      dataIndex: "tutor",
      sorter: true,
      key: "id",
      render: (_, { tutor_name, id }) => (
        <>
          <div className="flex-col hidden text-blue-600 gap-x-4 sm:flex">
            <div className="font-semibold">{tutor_name}</div>
          </div>
          <div className="flex-col gap-x-4 sm:hidden text-blue-600">
            <Link href={`/tutors/${id}`}>{tutor_name}</Link>
          </div>
        </>
      ),
    },
    {
      title: "Tutor Type",
      dataIndex: "tutor_type",
      key: "tutor_type",
      sorter: true,
      render: (_, { tutor_type, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{tutor_type}</div>
          </div>
        </>
      ),
    },
    {
      title: "Availabilty",
      dataIndex: "availabilty_times",
      key: "availabilty_times",
      sorter: true,
      render: (_, { availabilty_times }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">
              {availabilty_times?.map((item, index) => (
                <div key={generateUniqueKey()}>
                  <Tag color="cyan" className="w-10">
                    {" "}
                    {getLabelByValue(daysOption, item.day)}
                  </Tag>{" "}
                  <Tag> {item.start_time} </Tag>- <Tag>{item.end_time}</Tag>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourly_rate",
      key: "hourly_rate",
      sorter: true,
      render: (_, { hourly_rate }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{`ETB ${hourly_rate || 0}`}</div>
          </div>
        </>
      ),
    },
    {
      title: "No of Review",
      dataIndex: "no_of_review",
      key: "no_of_review",
      sorter: true,
      render: (_, { no_of_review }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{no_of_review}</div>
          </div>
        </>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      sorter: true,
      render: (_, { location, zone_name, woreda_name }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">
              <span>
                {zone_name} - {woreda_name}
              </span>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "status",
      sorter: true,
      render: (_, { status, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">
              {status === ActionStatusName.RequestSubmitted ? (
                <Tag color="blue">Tutor Requested</Tag>
              ) : status === ActionStatusName.RequestApproved ? (
                <Tag color="success">Tutor Approved</Tag>
              ) : status === ActionStatusName.RequestSuspended ? (
                <Tag color="warning">Tutor Suspended</Tag>
              ) : status === ActionStatusName.RequestTerminated ? (
                <Tag color="volcano">Tutor Terminated</Tag>
              ) : (
                <Tag color="error">Tutor Rejected</Tag>
              )}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Is Active",
      dataIndex: "is_active",
      key: "is_active",
      sorter: true,
      render: (_, { is_active, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
              {is_active?"Active":"Inactive"}
          </div>
        </>
      ),
    },
    {
      title: "Requested At",
      dataIndex: "request_date",
      key: "request_date",
      sorter: true,
      render: (_, { request_date, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{formatDateTime(request_date)}</div>
          </div>
        </>
      ),
    },
    {
      title: <CaretDownOutlined />,
      dataIndex: "action",
      key: "action",
      width: 70,
      render: (_, detail) => {
        const items = renderMenuItem(detail);
        return items.length ? (
          <Dropdown
            className="border-none"
            menu={{ items }}
            trigger={["click"]}
          >
            <Button>
              <MoreOutlined className="" size={200} />
            </Button>
          </Dropdown>
        ) : (
          <></>
        );
      },
    },
  ];
  const deleteData = (id: string) => {
    loading.startLoading();
    tutorService
      .deleteTutor(id)
      .then((value) => {
        getTutors();
        
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  const renderMenuItem = (detail: Tutor) => {
    const items = [
      {
        label: (
          <Popconfirm
            title="Delete the Course"
            description="Are you sure to delete this Course?"
            onConfirm={() => deleteData(detail?.id)}
            okText="Yes"
            cancelText="No"
          >
            delete
          </Popconfirm>
        ),
        key: "42",
        visible:true
      },
    ];
    return items.filter((item) => item.visible != false);
    // return items;
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<Tutor> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  return (
    <div className="relative w-full pb-20 add-border">
      {
        currentPath=="/tutor_register"?(<div>
             {
              tutorsData.length>0?(
                <div>
 <CustomTable
          rowSelection={rowSelection}
          columns={tutorsColumns}
          dataSource={tutorsData}
         
          updateRowSelected={setSelectedRowKeys}
          pagination={false}
          rowKey="id"
          header="id"
        />
                </div>
              ):(
<form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex-wrap md:flex md:gap-x-2 md:gap-4 lg:flex-nowrap">
          <legend>Prefered tuition area</legend>
          <CustomDropdown
            register={register}
            label="region"
            error={errors.region}
            options={{
              required: "Region is required",
            }}
            placeholder="Region"
            data={regionOptions}
            isSearchable
            onInputChange={(search) =>
              getLocations(search, location_type.region, setRegionOptions)
            }
            control={control}
          />
          <CustomDropdown
            register={register}
            label="zone"
            error={errors.zone}
            options={{
              required: "K/Ketema/Zone is required",
            }}
            placeholder="K/Ketema/Zone"
            isDisable={!getValues("region")}
            data={zoneOptions}
            isSearchable
            onInputChange={(search) =>
              getLocations(
                search,
                location_type.zone,
                setZoneOptions,
                getValues("region")
              )
            }
            control={control}
          />
          <CustomDropdown
            register={register}
            label="location"
            error={errors.location}
            options={{
              required: "Woreda is required",
            }}
            isDisable={!getValues("zone")}
            placeholder="Woreda"
            data={locationOptions}
            isSearchable
            onInputChange={(search) =>
              getLocations(
                search,
                location_type.woreda,
                setLocationOptions,
                getValues("zone")
              )
            }
            control={control}
          />
          <CustomInput
            type="text"
            className="min-w-[256px]"
            register={register}
            label="nearest_location"
            error={errors.nearest_location}
            options={{
              required: "Nearest location is required",
            }}
            placeholder="Your nearest location"
          />
        </fieldset>
        <div className="flex-wrap items-center md:flex md:gap-x-2 md:gap-4 md:flex-nowrap">
          <CustomInput
            type="text"
            className="min-w-[256px]"
            register={register}
            label="hourly_rate"
            error={errors.hourly_rate}
            options={{
              required: "Hourly Rate is required",
            }}
            placeholder="Price per hour"
          />
          {/* <CustomDropdown
            className="w-full "
            register={register}
            label="tutor_type"
            error={errors.tutor_type}
            options={{
              required: "Tutor Type is required",
            }}
            control={control}
            data={tutorTypeOptions}
            placeholder="Tutor Type(Grade Level)"
          /> */}

<CustomDropdown
            register={register}
            label="tutor_type"
            // error={errors.preferred_subject}
            options={{
              required: "tutor_type is required",
            }}
            placeholder="tutor_type"
            data={preferredGradeOptions}
            isSearchable
            onInputChange={(search) => getGrades(search)}
            control={control}
            multiple
            tooltipdescription={"Organize them in your preferred order when adding grade."}
          />

          <CustomDropdown
            register={register}
            label="preferred_subject"
            // error={errors.preferred_subject}
            options={{
              required: "Preferred subject is required",
            }}
            placeholder="Subject"
            data={preferredSubjectOptions}
            isSearchable
            onInputChange={(search) => getPreferredSubjects(search)}
            control={control}
            multiple
            tooltipdescription={"Organize them in your preferred order when adding subjects."}
          />
          <div className="w-full"></div>
        </div>
        <div className="justify-center md:flex md:mr-10">
          <CustomTextArea
            register={register}
            label="introduction"
            error={errors.introduction}
            options={{
              required: "Introduction is required",
            }}
            placeholder="Introduction"
            className="w-10"
          />
        </div>
        <div className="justify-center md:flex-col md:mr-10">
          <div className="mt-5 text-slate-400">
            <h1>*Please Add Availability below</h1>
          </div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex-wrap items-center justify-between w-full md:flex gap-x-2 md:flex-nowrap md:gap-4"
            >
              <CustomDropdown
                type="number"
                register={register}
                label={`availabilty_times.${index}.day` as const}
                error={
                  handleArrayField(errors.availabilty_times, index, "day")?.day
                }
                options={{
                  required: "Day is required",
                  validate: {},
                }}
                control={control}
                data={Days}
                placeholder="Day....."
              />
              <CustomInput
                type="time"
                register={register}
                label={`availabilty_times.${index}.start_time` as const}
                error={
                  handleArrayField(
                    errors.availabilty_times,
                    index,
                    "start_time"
                  )?.start_time
                }
                options={{
                  required: "Start Time is required",
                }}
                placeholder="Start Time"
              />
              <CustomInput
                type="time"
                register={register}
                label={`availabilty_times.${index}.end_time` as const}
                error={
                  handleArrayField(errors.availabilty_times, index, "end_time")
                    ?.end_time
                }
                options={{
                  required: "End Time is required",
                  validate: {},
                }}
                placeholder="End Time"
              />
              <button
                type="button"
                className="mt-5 text-red-700"
                onClick={() => remove(index)}
              >
                <FaMinusCircle size={24} scale={2} />{" "}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-5 text-custom_orange-700"
            onClick={() =>
              append({ day: 100, start_time: "luo", end_time: "luo" })
            }
          >
            <FaPlusCircle size={24} scale={2} />
          </button>
          <div className="flex flex-col">
            {!props?.itemDetail && (
              <CustomButton
                is_loading={<SmallLoading {...loading} />}
                text={"Submit Request"}
                type="submit"
                className=""
              />
            )}
            {props?.itemDetail && (
              <CustomButton
                is_loading={<SmallLoading {...loading} />}
                text={"Edit Request"}
                type="submit"
                className="mt-7 sm:w-[15%]"
              />
            )}
          </div>
        </div>
      </form>
              )
             }

        </div>):( <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="flex-wrap md:flex md:gap-x-2 md:gap-4 lg:flex-nowrap">
          <legend>Prefered tuition area</legend>
          <CustomDropdown
            register={register}
            label="region"
            error={errors.region}
            options={{
              required: "Region is required",
            }}
            placeholder="Region"
            data={regionOptions}
            isSearchable
            onInputChange={(search) =>
              getLocations(search, location_type.region, setRegionOptions)
            }
            control={control}
          />
          <CustomDropdown
            register={register}
            label="zone"
            error={errors.zone}
            options={{
              required: "K/Ketema/Zone is required",
            }}
            placeholder="K/Ketema/Zone"
            isDisable={!getValues("region")}
            data={zoneOptions}
            isSearchable
            onInputChange={(search) =>
              getLocations(
                search,
                location_type.zone,
                setZoneOptions,
                getValues("region")
              )
            }
            control={control}
          />
          <CustomDropdown
            register={register}
            label="location"
            error={errors.location}
            options={{
              required: "Woreda is required",
            }}
            isDisable={!getValues("zone")}
            placeholder="Woreda"
            data={locationOptions}
            isSearchable
            onInputChange={(search) =>
              getLocations(
                search,
                location_type.woreda,
                setLocationOptions,
                getValues("zone")
              )
            }
            control={control}
          />
          <CustomInput
            type="text"
            className="min-w-[256px]"
            register={register}
            label="nearest_location"
            error={errors.nearest_location}
            options={{
              required: "Nearest location is required",
            }}
            placeholder="Your nearest location"
          />
        </fieldset>
        <div className="flex-wrap items-center md:flex md:gap-x-2 md:gap-4 md:flex-nowrap">
          <CustomInput
            type="text"
            className="min-w-[256px]"
            register={register}
            label="hourly_rate"
            error={errors.hourly_rate}
            options={{
              required: "Hourly Rate is required",
            }}
            placeholder="Price per hour"
          />
         <CustomDropdown
            register={register}
            label="tutor_type"
            // error={errors.preferred_subject}
            options={{
              required: "tutor_type is required",
            }}
            placeholder="tutor_type"
            data={preferredGradeOptions}
            isSearchable
            onInputChange={(search) => getGrades(search)}
            control={control}
            multiple
            tooltipdescription={"Organize them in your preferred order when adding grade."}
          />
          <CustomDropdown
            register={register}
            label="preferred_subject"
            // error={errors.preferred_subject}
            options={{
              required: "Preferred subject is required",
            }}
            placeholder="Subject"
            data={preferredSubjectOptions}
            isSearchable
            onInputChange={(search) => getPreferredSubjects(search)}
            control={control}
            multiple
            tooltipdescription={"Organize them in your preferred order when adding subjects."}
          />
          <div className="w-full"></div>
        </div>
        <div className="justify-center md:flex md:mr-10">
          <CustomTextArea
            register={register}
            label="introduction"
            error={errors.introduction}
            options={{
              required: "Introduction is required",
            }}
            placeholder="Introduction"
            className="w-10"
          />
        </div>
        <div className="justify-center md:flex-col md:mr-10">
          <div className="mt-5 text-slate-400">
            <h1>*Please Add Availability below</h1>
          </div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex-wrap items-center justify-between w-full md:flex gap-x-2 md:flex-nowrap md:gap-4"
            >
              <CustomDropdown
                type="number"
                register={register}
                label={`availabilty_times.${index}.day` as const}
                error={
                  handleArrayField(errors.availabilty_times, index, "day")?.day
                }
                options={{
                  required: "Day is required",
                  validate: {},
                }}
                control={control}
                data={Days}
                placeholder="Day....."
              />
              <CustomInput
                type="time"
                register={register}
                label={`availabilty_times.${index}.start_time` as const}
                error={
                  handleArrayField(
                    errors.availabilty_times,
                    index,
                    "start_time"
                  )?.start_time
                }
                options={{
                  required: "Start Time is required",
                }}
                placeholder="Start Time"
              />
              <CustomInput
                type="time"
                register={register}
                label={`availabilty_times.${index}.end_time` as const}
                error={
                  handleArrayField(errors.availabilty_times, index, "end_time")
                    ?.end_time
                }
                options={{
                  required: "End Time is required",
                  validate: {},
                }}
                placeholder="End Time"
              />
              <button
                type="button"
                className="mt-5 text-red-700"
                onClick={() => remove(index)}
              >
                <FaMinusCircle size={24} scale={2} />{" "}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-5 text-custom_orange-700"
            onClick={() =>
              append({ day: 100, start_time: "luo", end_time: "luo" })
            }
          >
            <FaPlusCircle size={24} scale={2} />
          </button>
          <div className="flex flex-col">
            {!props?.itemDetail && (
              <CustomButton
                is_loading={<SmallLoading {...loading} />}
                text={"Submit Request"}
                type="submit"
                className=""
              />
            )}
            {props?.itemDetail && (
              <CustomButton
                is_loading={<SmallLoading {...loading} />}
                text={"Edit Request"}
                type="submit"
                className="mt-7 sm:w-[15%]"
              />
            )}
          </div>
        </div>
      </form>)
      }
     
    </div>
  );
};

export default TutorAdd;

const classNameInput =
  "h-12 w-full px-6 mt-2 text-base text-custom_black-200 transition-all duration-300 ease-in border-solid focus:outline-custom_orange-900 border-custom_orange-100 border rounded-xl bg-white";
