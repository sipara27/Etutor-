"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  MenuProps,
  Modal,
  Pagination,
  Popconfirm,
  Table,
  Tag,
  message,
} from "antd";
import { usePagination } from "../../customs/pagination/usePagination";
import { SearchComponentProps } from "../../commons/search-bar/search";
import {
  ActionStatusName,
  ContractStatus,
  ContractStatusWithLable,
  componentType,
} from "../../../types/Enums";
import Loading from "../../customs/loading/Loading";
import useLoading from "../../customs/loading/LoadingHook";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import {
  ETutorContract,
  ETutorContractFilterModel,
  PartialETutorContract,
} from "../../../types/ETutorContractItem";
import { useETutorContractService } from "./ETutorContractService";
import SearchBar from "../../commons/search-bar/SearchBar";
import EtutorContractCard from "./EtutorContractCard";
import { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";
import Link from "next/link";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import CustomTable from "@/components/commons/Table/Table";
import useAuthorization from "@/components/account/auth/authorization";
import { formatDateTime } from "@/utils/date";
import ListHeader from "@/components/commons/ListHeader";
import { usePathname } from "next/navigation";

export interface Props {
  navigateTo?: string;
  url?: string;
}

const TutorContractList = (props: Props) => {
  const user = useSelector((state: AppState) => state.user);
  const [data, setData] = useState<ETutorContract[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedData, setSelectedData] = useState<ETutorContract>();
  const loading = useLoading();
  const apiService = useETutorContractService();
  const authorize = useAuthorization();
  const [destroyOnHide, setDestroyOnHid] = useState<boolean>(false);
  const pathname = usePathname();
  const paginator = usePagination<ETutorContractFilterModel>({
    ps: 5,
    user_id: user?.id,
  });

  useEffect(() => {
    searchDatas();
  }, [paginator.filterData]);

  const searchDatas = () => {
    loading.startLoading();
    apiService
      .getETutorContracts(paginator?.filterData)
      .then((value) => {
        setData(value?.data.results);
        setShowAdd(false);

        paginator.setTotal(value.data.count);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const deleteData = (data: ETutorContract) => {
    loading.startLoading();
    apiService
      .deleteETutorContract(data)
      .then((value) => {
        setData(value.data.results);
        searchDatas();
        setSelectedData(undefined);
        loading.stopLoading();
        message.success("Successfully deleted!");
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const handleETutorContractApprove = (
    id: string,
    whichStatus = ContractStatus.ACCEPTED
  ) => {
    loading.startLoading();
    let data: PartialETutorContract;
    if (whichStatus === ContractStatus.ACCEPTED) {
      data = { status: ContractStatus.ACCEPTED };
    } else if (whichStatus === ContractStatus.TERMINATED) {
      data = { status: ContractStatus.TERMINATED, end_date: new Date() };
    } else {
      data = { status: ContractStatus.SUSPEND };
    }

    apiService
      .partialUpdateTutorContract(id, data)
      .then((value: any) => {
        searchDatas();
        loading.stopLoading();
        message.success("Successfully approved!");
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const handleETutorContractReject = (
    id: string,
    item: PartialETutorContract
  ) => {
    loading.startLoading();
    let data: PartialETutorContract = { status: ContractStatus.REJECTED };
    apiService
      .partialUpdateTutorContract(id, data)
      .then((value: any) => {
        searchDatas();
        setDestroyOnHid(true);
        loading.stopLoading();
        message.success("Successfully rejected!");
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const handleETutorContractAgree = (
    id: string,
    item: PartialETutorContract
  ) => {
    loading.startLoading();
    let data: PartialETutorContract = { status: ContractStatus.AGREE };
    apiService
      .partialUpdateTutorContract(id, data)
      .then((value: any) => {
        searchDatas();
        setDestroyOnHid(true);
        loading.stopLoading();
        message.success("Successfully agreed!");
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
    {
      placeholder: "Request Status",
      key: "status",
      type: componentType.DROPDOWN,
      options: ContractStatusWithLable,
      default: 101,
    },
  ];

  const actionStatusTag = (status: number) => {
    return (
      <div className="">
        {status === ContractStatus.ACCEPTED ? (
          <Tag color="success">Contract Accepted</Tag>
        ) : status === ContractStatus.REQUESTED ? (
          <Tag color="blue">Contract Requested</Tag>
        ) : status === ContractStatus.REJECTED ? (
          <Tag color="error">Contract Rejected</Tag>
        ) : status === ContractStatus.SUSPEND ? (
          <Tag color="warning">Contract Suspended</Tag>
        ) : status === ContractStatus.AGREE ? (
          <Tag color="processing">Contract Agreed</Tag>
        ) : (
          <Tag color="volcano">Contract Terminated</Tag>
        )}
      </div>
    );
  };

  const tutorContracts: ColumnsType<ETutorContract> = [
    {
      title: "Profile",
      dataIndex: "profile_picture",
      sorter: false,
      key: "profile_picture",
      render: (_, data) => (
        <>
          <div className="flex-col gap-x-4 sm:flex">
            <Link
              href={
                data.status !== ContractStatus.ACCEPTED
                  ? `/dashboard/contracts/${data.id}`
                  : ""
              }
            >
              {data.profile_picture ? (
                <Avatar src={data.profile_picture} shape="circle" />
              ) : (
                <Avatar src="/images/profile.png" shape="circle" />
              )}
            </Link>
          </div>
          <div className="md:hidden">
            <div
              className={`font-semibold text-blue-400 ${
                user.id === data.student ? "hidden" : ""
              }`}
            >
              Student Name: {user.id === data.student}
              {data.student_name}
            </div>
            <div
              className={`text-normal text-blue-400 text-[12px] ${
                user.id === data.tutor_id ? "hidden" : ""
              }`}
            >
              {data.tutor_name && "Tutor Name: " + data.tutor_name}
            </div>
            <div className="text-normal text-[12px]">
              {actionStatusTag(data.status as number)}
            </div>

            <div className="text-normal text-gray-6F text-[12px]">
              {data.hourly_rate && "Hourly Rate: " + data.hourly_rate}
            </div>
            <div className="text-normal text-gray-6F text-[12px]">
              {data.student_phone_num &&
                "Phone Number: " + data.student_phone_num}
            </div>
            <div className="text-normal text-gray-6F text-[12px]">
              {data.student_subject && "Subject: " + data.student_subject}
            </div>
            <div className="text-normal text-gray-6F text-[12px]">
              {data.payment_date &&
                "Payment date: " + formatDateTime(data.payment_date)}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Student Name",
      dataIndex: "student_name",
      sorter: true,
      key: "id",
      render: (_, data) => (
        <>
          <div className="flex-col text-blue-600 hidden gap-x-4 sm:flex">
            <div className="font-semibold">
              <Link
                href={
                  data.status !== ContractStatus.REQUESTED
                    ? pathname === `/dashboard/contracts`
                      ? `/dashboard/contracts/${data.id}`
                      : `/portal/${data.id}`
                    : ""
                }
              >
                {`${data.student_name}`}
              </Link>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Student Phone",
      dataIndex: "student_phone_num",
      sorter: true,
      key: "student_phone_num",
      render: (_, { student_phone_num, id }) => (
        <>
          <div className="flex-col  hidden gap-x-4 sm:flex">
            <div className="font-semibold">{`${student_phone_num}`}</div>
          </div>
        </>
      ),
    },
    {
      title: "Tutor Name",
      dataIndex: "tutor_name",
      key: "tutor_name",
      sorter: true,
      render: (_, { tutor_name, id }) => (
        <>
          <div className="flex flex-row text-blue-600 gap-x-4 sm:flex-col">
            <div className="">{tutor_name}</div>
          </div>
        </>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "payment_date",
      sorter: true,
      render: (_, { payment_date }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{formatDateTime(payment_date)}</div>
          </div>
        </>
      ),
    },
    {
      title: "Grade",
      dataIndex: "student_level",
      key: "student_level",
      sorter: true,
      render: (_, { student_level }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col sm:max-w-[400px]">
            <div className="w-full text-wrap">{student_level}</div>
          </div>
        </>
      ),
    },
    {
      title: "Student Subject",
      dataIndex: "student_subject",
      key: "student_subject",
      sorter: true,
      render: (_, { student_subject }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col sm:max-w-[400px]">
            <div className="w-full text-wrap">{student_subject}</div>
          </div>
        </>
      ),
    },
    {
      title: "Started At",
      dataIndex: "payment_date",
      key: "payment_date",
      sorter: true,
      render: (_, { payment_date, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{formatDateTime(payment_date)}</div>
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
            {actionStatusTag(status as number)}
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
        const items: any = renderMenuItem(detail);
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
  const renderMenuItem = (detail: ETutorContract) => {
    const items = [
      {
        label: "Approve Request",
        key: "1",
        onClick: () => handleETutorContractApprove(detail.id),
        visible:
          (authorize.otherAction("tutorcontract") &&
            detail?.status === ContractStatus.REQUESTED &&
            user.id !== detail.tutor_id) ||
          user.is_superuser,
      },
      {
        label: "Terminate",
        key: "2",
        onClick: () =>
          handleETutorContractApprove(detail.id, ContractStatus.TERMINATED),
        visible:
          (authorize.otherAction("tutorcontract") &&
            detail?.status === ContractStatus.ACCEPTED &&
            user.id !== detail.tutor_id) ||
          user.is_superuser,
      },
      {
        label: "Suspend",
        key: "3",
        onClick: () =>
          handleETutorContractApprove(detail.id, ContractStatus.SUSPEND),
        visible:
          (authorize.otherAction("tutorcontract") &&
            detail?.status === ContractStatus.ACCEPTED &&
            user.id !== detail.tutor_id) ||
          user.is_superuser,
      },
      {
        label: "Reject Request",
        key: "4",
        onClick: () => handleETutorContractReject(detail.id, detail),
        visible:
          (authorize.otherAction("tutorcontract") &&
            detail?.status === ContractStatus.REQUESTED &&
            user.id !== detail.tutor_id) ||
          user.is_superuser,
      },
      {
        label: "Agree Contract",
        key: "4",
        onClick: () => handleETutorContractAgree(detail.id, detail),
        visible:
          authorize.canUpdate("tutorcontract") &&
          detail?.status === ContractStatus.REQUESTED &&
          user.id === detail.tutor_id,
      },
      {
        label: "Edit",
        key: "5",
        onClick: () => {
          setShowAdd(!showAdd);
          setSelectedData(detail);
        },
        visible:
          authorize.canUpdate("tutorcontract") &&
          detail?.status === ContractStatus.REQUESTED &&
          user.id === detail.student,
      },
      {
        label: "Delete",
        key: "6",
        onClick: () => {
          deleteData(detail);
        },
        visible:
          authorize.canDelete("tutorcontract") &&
          detail?.status === ContractStatus.REQUESTED &&
          user.id === detail.student,
      },
    ];

    return items.filter((item) => item.visible != false);
    // return items;
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<ETutorContract> = {
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
        <ListHeader title="Tutor Contracts" />
        <SearchBar
          components={components}
          handleChange={paginator.handleChange}
          filteredData={paginator.filterData}
        />
        {data?.length === 0 ? (
          <Empty className="flex justify-center w-full" />
        ) : (
          <div>
            <CustomTable
              rowSelection={rowSelection}
              columns={tutorContracts}
              dataSource={data}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="profile_picture"
            />
            <Pagination
              className={`pagination-bar mt-3 ${
                data?.length === 0 ? "hidden" : ""
              }`}
              {...paginator}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TutorContractList;
