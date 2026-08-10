"use client";
import { useEffect, useState } from "react";
import {
  ActionStatus,
  ActionStatusName,
  componentType,
  daysOption,
  tutorTypeOptions,
} from "../../../types/Enums";
import { usePagination } from "../../customs/pagination/usePagination";
import SearchBar from "../../commons/search-bar/SearchBar";
import { SearchComponentProps } from "../../commons/search-bar/search";
import useTutorService from "./ToturService";
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  Flex,
  Form,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Space,
  Table,
  Tag,
} from "antd";
import { getLabelByValue } from "../../../utils/array";
import Link from "next/link";
import { AppState } from "@/state/store/store";
import { useSelector } from "react-redux";
import {
  AvailableTime,
  PartialTutorRequest,
  Tutor,
  TutorInfoFilterModel,
} from "./TutorInfoModel";
import useLoading from "../../customs/loading/LoadingHook";
import TextArea from "antd/es/input/TextArea";
import TutorAdd from "./TutorAdd";
import CustomButton from "../../customs/custom-button/CustomButton";
import SmallLoading from "../../customs/loading/SmallLoading";
import useAuthorization from "../../account/auth/authorization";
import { formatDateTime } from "../../../utils/date";
import { generateUniqueKey, IsWindowUndefined } from "@/utils/func_utils";
import { ColumnsType } from "antd/es/table";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import CustomTable from "@/components/commons/Table/Table";
import { TableRowSelection } from "antd/es/table/interface";
import ListHeader from "@/components/commons/ListHeader";
import InstructorBasicInfo from "@/components/courses/tobe-instructor-request/InstructorBasicInfo";
import { SelectItem } from "@/types/MenuItems";
import useGradeService, { Grade } from "../grade/GradeService";

const TutorInfoInstructorList = () => {
  const [datas, setDatas] = useState<Tutor[]>([]);
  const [destroyOnHide, setDestroyOnHid] = useState<boolean>(false);
  const [toBeDeleteId, setToBeDeleteId] = useState<string>("");
  const [selectedData, setSelectedData] = useState<Tutor>();
  const [showAdd, setShowAdd] = useState(false);
  const gradeService = useGradeService()
  const apiService = useTutorService();
  const authorize = useAuthorization();
  

  const user = useSelector((state: AppState) => state.user);
  const paginator = usePagination<TutorInfoFilterModel>({
    ps: 5,
    status: ActionStatusName.RequestApproved,
  });
  const [preferredGradeOptions, setPreferredGradeOptions] = useState<
  SelectItem<string>[]
>([]);
  const authorization = useAuthorization();
  const loading = useLoading();
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
  
  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
    {
      placeholder: "Grade",
      key: "tutor_type",
      type: componentType.DROPDOWN,
      options: preferredGradeOptions,
    },
    {
      placeholder: "Request Status",
      key: "status",
      type: componentType.DROPDOWN,
      options: ActionStatus,
      default: ActionStatusName.RequestSubmitted,
    },
  ];

  const onClose = () => {
    setShowAdd(false);
    setSelectedData(undefined);
  };
  

  useEffect(() => {
    getGrades()
    if (authorization.otherAction("tutor")) {
      searchAllDatas();
    } else {
      searchDatas();
    }    
  }, [paginator.filterData]);


  const searchDatas = () => {
    apiService.getTutors(paginator.filterData).then(({ data: response }) => {
      if (response.results) {
        setDatas(response.results);
        setShowAdd(false);
        paginator.setTotal(response.count);
      }
    });
  };

  const searchAllDatas = () => {
    apiService
      .getTutorsData({ ...paginator.filterData, get_data: "get_data" })
      .then(({ data: response }) => {
        if (response.results) {
          setDatas(response.results);
          paginator.setTotal(response.count);
        }
      });
  };

  const handleInstructorApprove = (id: string) => {
    loading.startLoading();
    let data: PartialTutorRequest = {
      status: ActionStatusName.RequestApproved,
    };
    apiService
      .partialUpdateTutorRequest(id, data)
      .then((value) => {
        searchDatas();
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const handleInstructorReject = (id: string, item: PartialTutorRequest) => {
    loading.startLoading();
    let data: PartialTutorRequest = {
      status: ActionStatusName.RequestRejected,
      is_active: false,
      comment: item.comment,
    };
    apiService
      .partialUpdateTutorRequest(id, data)
      .then((value) => {
        searchDatas();
        setDestroyOnHid(true);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  const handleInstructorSuspend = (id: string, item: PartialTutorRequest) => {
    loading.startLoading();
    let data: PartialTutorRequest = {
      status: ActionStatusName.RequestSuspended,
      is_active: false,
      comment: item.comment,
    };
    apiService
      .partialUpdateTutorRequest(id, data)
      .then((value) => {
        searchDatas();
        setDestroyOnHid(true);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  const handleInstructorTerminate = (id: string, item: PartialTutorRequest) => {
    loading.startLoading();
    let data: PartialTutorRequest = {
      status: ActionStatusName.RequestTerminated,
      is_active: false,
      comment: item.comment,
    };
    apiService
      .partialUpdateTutorRequest(id, data)
      .then((value) => {
        searchDatas();
        setDestroyOnHid(true);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  const handleReject = (value: Tutor) => {
    setToBeDeleteId(value.id);
  };

  const onFinish = (items: PartialTutorRequest) => {
    handleInstructorReject(toBeDeleteId, items);
  };

  const onFinishFailed = (errorInfo: any) => { };

  const deleteData = (id: string) => {
    loading.startLoading();
    apiService
      .deleteTutor(id)
      .then((value) => {
        searchDatas();
        setSelectedData(undefined);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  const content = (
    <>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<PartialTutorRequest> name="comment">
          <TextArea rows={5} />
        </Form.Item>
        <Button
          htmlType="submit"
          style={{ color: "gray" }}
          className="hover:bg-gray-100"
        >
          Submit
        </Button>
      </Form>
    </>
  );

  const handleRequestStatusJsx = (value: Tutor) => (
    <>
      {authorization.otherAction("tutor") ? (
        <>
          {value?.status === ActionStatusName.RequestSubmitted ? (
            <>
              <Flex gap="small" vertical>
                <Flex gap="small" wrap="wrap">
                  <CustomButton
                    text="Approve Request"
                    className="custom-button"
                    fun={() => handleInstructorApprove(value.id)}
                    is_loading={<SmallLoading {...loading} />}
                  />
                </Flex>
              </Flex>
              <Flex gap="small" vertical>
                <Flex gap="small" wrap="wrap">
                  <Space wrap>
                    <Popover
                      destroyTooltipOnHide={destroyOnHide}
                      content={content}
                      title="Rejection comment"
                      trigger="click"
                    >
                      <span>
                        <CustomButton
                          text="Reject Request"
                          className="custom-button"
                          fun={() => handleReject(value)}
                          is_loading={<SmallLoading {...loading} />}
                        />
                      </span>
                    </Popover>
                  </Space>
                </Flex>
              </Flex>
            </>
          ) : value?.status === ActionStatusName.RequestApproved ? (
            <Flex gap="small" vertical>
              <Flex gap="small" wrap="wrap">
                <CustomButton
                  text="Request Approved"
                  disabled={!value.status ? false : true}
                  className="custom-button-disabled"
                />
              </Flex>
            </Flex>
          ) : (
            <Flex gap="small" vertical>
              <Flex gap="small" wrap="wrap">
                <CustomButton
                  text="Request Rejected"
                  disabled={!value.status ? false : true}
                  className="custom-button-disabled"
                />
              </Flex>
            </Flex>
          )}
        </>
      ) : (
        <Flex gap="small" vertical>
          <Flex gap="small" wrap="wrap">
            <Button
              className="custom-button-disabled"
              disabled={!value.status ? false : true}
              loading={loading.loading}
            >
              {value?.status === ActionStatusName.RequestSubmitted
                ? "Request Submitted"
                : value?.status === ActionStatusName.RequestApproved
                  ? "Request Approved"
                  : value?.status === ActionStatusName.RequestRejected
                    ? "Request Rejected"
                    : ""}
            </Button>
          </Flex>
        </Flex>
      )}
    </>
  );

  const filterUniqueDays = (times: AvailableTime[]) => {
    const seenDays = new Set<number>();

    return times.filter((time) => {
      if (!seenDays.has(time.day) && time.day >= 1 && time.day <= 7) {
        seenDays.add(time.day);
        return true;
      }
      return false;
    });
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
      render: (_, { preferred_grade_names, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{preferred_grade_names?.join(", ")}</div>
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
  const renderMenuItem = (detail: Tutor) => {
    const items = [
      {
        label: "Approve Request",
        key: "1",
        onClick: () => handleInstructorApprove(detail.id),
        visible:(detail?.status === ActionStatusName.RequestSubmitted && user.is_superuser==true),
      },
      {
        label: "Reject Request",
        key: "2",
        onClick: () => handleInstructorReject(detail.id, detail),
        visible:
         ( detail?.status === ActionStatusName.RequestSubmitted&& user.is_superuser==true),
      },
      {
        label: "Suspend Request",
        key: "3",
        onClick: () => handleInstructorSuspend(detail.id, detail),
        visible:
          ( detail?.status === ActionStatusName.RequestApproved && user.is_superuser==true),
      },
      {
        label: "Terminate Request",
        key: "4",
        onClick: () => handleInstructorTerminate(detail.id, detail),
        visible:  ( detail?.status === ActionStatusName.RequestApproved && user.is_superuser==true),
      },
      {
        label: "Unsuspend tutor",
        key: "5",
        onClick: () => handleInstructorApprove(detail.id),
        visible:(detail?.status === ActionStatusName.RequestSuspended && user.is_superuser==true),
      },
      {
        label: "Edit",
        key: "5",
        onClick: () => {
          setShowAdd(!showAdd);
          setSelectedData(detail);
        },
        visible:
          (authorize.canUpdate("tutor") &&
          detail?.status === ActionStatusName.RequestSubmitted)&&(user.id === detail.tutor),
      },
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
        visible:
          (authorize.canDelete("tutor") &&
          detail?.status === ActionStatusName.RequestSubmitted)&&(user.id === detail.tutor),
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
    <>
      <div className="container mx-auto px-5">
        <ListHeader title="To Be Tutor Request" addTitle="Add Tutor" add={() => setShowAdd(!showAdd)} load={searchDatas} hide={!authorize?.isStaff()} />
        <SearchBar
          components={components}
          handleChange={paginator.handleChange}
          filteredData={paginator.filterData}
        />

        <CustomTable
          rowSelection={rowSelection}
          columns={tutorsColumns}
          dataSource={datas}
          onChange={paginator.onSortChange}
          updateRowSelected={setSelectedRowKeys}
          pagination={false}
          rowKey="id"
          header="id"
        />
        <Pagination
          className={`pagination-bar mt-3 ${datas?.length === 0 ? "hidden" : ""
            }`}
          {...paginator}
        />
        {datas?.length === 0 ? (
          <Empty className="flex justify-center w-full" />
        ) : (
          ""
        )}
      </div>

      {showAdd && <Modal
        open={showAdd}
        onCancel={onClose}
        footer={[]}
        width={IsWindowUndefined() && window?.innerWidth < 768 ? "100%" : "80%"}
        height={
          IsWindowUndefined() && window?.innerWidth < 768 ? "100%" : "80%"
        }
      >
        <TutorAdd
          searchDatas={searchDatas}
          itemDetail={selectedData}
          cancel={onClose}
        />
      </Modal>
      }

    </>
  );
};

export default TutorInfoInstructorList;
