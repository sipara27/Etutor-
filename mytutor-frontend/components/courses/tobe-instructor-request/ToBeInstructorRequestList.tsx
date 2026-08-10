"use client";
import { useContext, useEffect, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  Flex,
  Form,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Space,
  Table,
  Tag,
} from "antd";
import { usePagination } from "../../customs/pagination/usePagination";
import { SearchComponentProps } from "../../commons/search-bar/search";
import {
  ActionStatus,
  ActionStatusName,
  componentType,
} from "../../../types/Enums";
import useLoading from "../../customs/loading/LoadingHook";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import {
  PartialToBeInstructorRequest,
  ToBeInstructorRequest,
  ToBeInstructorRequestFilterModel,
} from "./ToBeInstructorRequestModel";
import { useToBeInstructorService } from "./ToBeInstructorRequestService";
import ToBeInstructorRequestAdd from "./ToBeInstructorRequestAdd";
import { formatDateTime } from "../../../utils/date";
import TextArea from "antd/es/input/TextArea";
import { UserIdContext } from "../../account/auth/UserPages";
import SearchBar from "../../commons/search-bar/SearchBar";
import Profile, {
  UserContext,
} from "../../../component/course/ProfileInstructor";
import CustomButton from "../../customs/custom-button/CustomButton";
import SmallLoading from "../../customs/loading/SmallLoading";
import useAuthorization from "../../account/auth/authorization";
import useAuthentication from "../../account/auth/authentication";
import CustomTable from "@/components/commons/Table/Table";
import { Tutor } from "@/components/tutors/tutor/TutorInfoModel";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface Props {
  navigateTo?: string;
}

const ToBeInstructorRequestList = (props: Props) => {
  const user = useSelector((state: AppState) => state.user);
  const [data, setData] = useState<ToBeInstructorRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedData, setSelectedData] = useState<ToBeInstructorRequest>();
  const [toBeDeleteId, setToBeDeleteId] = useState<string>("");
 
  const [userDetailId, setUserDetailId] = useState("");
  const loading = useLoading();
  const apiService = useToBeInstructorService();
  const { userId } = useContext(UserContext);
  const { registeredUserId } = useContext(UserIdContext);
  const [open, setOpen] = useState(false);
  const authorization = useAuthorization();
  const authentication = useAuthentication();
  const authorize = useAuthorization();

  const paginator = usePagination<ToBeInstructorRequestFilterModel>({
    ps: 5,
    user_id: registeredUserId ? registeredUserId : userId,
    status: ActionStatusName.RequestSubmitted,
  });
  
  const pathname = usePathname()
  const currentPath = pathname;

  useEffect(() => {
    if (authorization.otherAction("tobeinstructorrequest")) {
      searchAllData("get_data");
    } else {
      searchDatas();
    }
  }, [paginator.filterData]);

  const searchDatas = () => {
    loading.startLoading();
    apiService
      .getToBeInstructorRequests({ ...paginator.filterData })
      .then((value) => {
        setData(value.data.results);
        setShowAdd(false);
        paginator.setTotal(value.data.count);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const searchAllData = (get_data: string) => {
    loading.startLoading();
    apiService
      .getToBeInstructorRequestsData({ ...paginator.filterData, get_data })
      .then((value) => {
        if (value?.data?.results?.length > 0) {
          setData(value.data.results);
          setShowAdd(false);
          paginator.setTotal(value.data.count);
        }
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const deleteData = (selectedData: ToBeInstructorRequest) => {
    loading.startLoading();
    apiService
      .deleteToBeInstructorRequest(selectedData!)
      .then((value) => {
        setData(value.data.results);
        searchDatas();
        setSelectedData(undefined);
        message.success("Successfully deleted!");
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const onClose = () => {
    setShowAdd(false);
    setSelectedData(undefined);
  };

  const handleInstructorApprove = (id: string) => {
    loading.startLoading();
    let data: PartialToBeInstructorRequest = {
      status: ActionStatusName.RequestApproved,
    };
    apiService
      .partialUpdateToBeInstructorRequest(id, data)
      .then((value) => {
        searchAllData("get_data");
        message.success("Successfully approved!");
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const handleInstructorReject = (
    id: string,
    item: PartialToBeInstructorRequest
  ) => {
    loading.startLoading();
    let data: PartialToBeInstructorRequest = {
      status: ActionStatusName.RequestRejected,
      comment: item.comment,
    };
    apiService
      .partialUpdateToBeInstructorRequest(id, data)
      .then((value) => {
        searchAllData("get_data");
     
        message.success("Successfully rejected!");
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const onFinish = (items: PartialToBeInstructorRequest) => {
    handleInstructorReject(toBeDeleteId, items);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
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
        <Form.Item<PartialToBeInstructorRequest> name="comment">
          <TextArea rows={4} />
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

  // const handleRequestStatusJsx = (value: ToBeInstructorRequest) => (
  //   <>
  //     {authorization.otherAction("tobeinstructorrequest") ? (
  //       <>
  //         {value?.status === ActionStatusName.RequestSubmitted ? (
  //           <>
  //             <Flex gap="small" vertical>
  //               <Flex gap="small" wrap="wrap">
  //                 <CustomButton
  //                   text="Approve Request"
  //                   fun={() => handleInstructorApprove(value.id)}
  //                   className="custom-button"
  //                   is_loading={<SmallLoading {...loading} />}
  //                 />
  //               </Flex>
  //             </Flex>
  //             <Flex gap="small" vertical>
  //               <Flex gap="small" wrap="wrap">
  //                 <Space wrap>
  //                   <Popover
  //                     destroyTooltipOnHide={destroyOnHide}
  //                     content={content}
  //                     title="Rejection comment"
  //                     trigger="click"
  //                   >
  //                     <span>
  //                       <CustomButton
  //                         text="Reject Request"
  //                         fun={() => {
  //                           setToBeDeleteId(value.id);
  //                         }}
  //                         className="custom-button"
  //                         is_loading={<SmallLoading {...loading} />}
  //                       />
  //                     </span>
  //                   </Popover>
  //                 </Space>
  //               </Flex>
  //             </Flex>
  //           </>
  //         ) : value?.status === ActionStatusName.RequestApproved ? (
  //           <Flex gap="small" vertical>
  //             <Flex gap="small" wrap="wrap">
  //               <CustomButton
  //                 text="Request Approved"
  //                 disabled={!value.status ? false : true}
  //                 className="custom-button-disabled"
  //               />
  //             </Flex>
  //           </Flex>
  //         ) : (
  //           <Flex gap="small" vertical>
  //             <Flex gap="small" wrap="wrap">
  //               <CustomButton
  //                 text="Request Rejected"
  //                 disabled={!value.status ? false : true}
  //                 className="custom-button-disabled"
  //               />
  //             </Flex>
  //           </Flex>
  //         )}
  //       </>
  //     ) : (
  //       <Flex gap="small" vertical>
  //         <Flex gap="small" wrap="wrap">
  //           <Button
  //             className="custom-button-disabled"
  //             disabled={!value.status ? false : true}
  //             loading={loading.loading}
  //           >
  //             {value?.status === ActionStatusName.RequestSubmitted
  //               ? "Request Submitted"
  //               : value?.status === ActionStatusName.RequestApproved
  //               ? "Request Approved"
  //               : value?.status === ActionStatusName.RequestRejected
  //               ? "Request Rejected"
  //               : ""}
  //           </Button>
  //         </Flex>
  //       </Flex>
  //     )}
  //   </>
  // );

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
      options: ActionStatus,
      default: ActionStatusName.RequestSubmitted,
    },
  ];

  const tutorsColumns: ColumnsType<ToBeInstructorRequest> = [
    {
      title: "",
      dataIndex: "profile_picture",
      sorter: false,
      key: "profile_picture",
      render: (_, { profile_picture, id }) => (
        <>
          <div className="flex-col hidden gap-x-4 sm:flex">
            {profile_picture ? (
              <Avatar src={profile_picture} shape="circle" />
            ) : (
              <Avatar src="/images/profile.png" shape="circle" />
            )}
          </div>
        </>
      ),
    },
    {
      title: "",
      dataIndex: "view",
      sorter: false,
      key: "view",
      render: (_, { user }) => (
        <>
          <div className="flex-col hidden gap-x-4 sm:flex w-10 cursor-pointer">
            <FaEye
              onClick={() => {
                setUserDetailId(user);
                setOpen(true);
              }}
            />
          </div>
        </>
      ),
    },
    {
      title: "Name",
      dataIndex: "tutor",
      sorter: true,
      key: "id",
      render: (_, { first_name, middle_name, id }) => (
        <>
          <div className="flex-col hidden gap-x-4 sm:flex">
            <div className="font-semibold">{`${first_name} ${middle_name}`}</div>
          </div>
          <div className="flex-col gap-x-4 sm:hidden">
            <Link href={`/tutors/${id}`}>{`${first_name} ${middle_name}`}</Link>
          </div>
        </>
      ),
    },
    {
      title: "Responder",
      dataIndex: "responder",
      key: "responder",
      sorter: true,
      render: (_, { responder, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{responder}</div>
          </div>
        </>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      sorter: true,
      render: (_, { comment }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">{comment}</div>
          </div>
        </>
      ),
    },
    {
      title: "Cover Letter",
      dataIndex: "cover_letter",
      key: "cover_letter",
      sorter: true,
      render: (_, { cover_letter }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col sm:max-w-[400px]">
            <div className="w-full text-wrap">{cover_letter}</div>
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
                <Tag color="blue">Requested</Tag>
              ) : status === ActionStatusName.RequestApproved ? (
                <Tag color="success">Approved</Tag>
              ) : (
                <Tag color="error">Rejected</Tag>
              )}
            </div>
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
  const renderMenuItem = (detail: ToBeInstructorRequest) => {
    const items = [
      {
        label: "Approve Request",
        key: "1",
        onClick: ()=>handleInstructorApprove(detail.id),
        visible:(detail?.status === ActionStatusName.RequestSubmitted) && (user.is_superuser ==true),
      },
      {
        label: "Reject Request",
        key: "2",
        onClick:()=>handleInstructorReject(detail.id,detail),
        visible:(detail?.status === ActionStatusName.RequestSubmitted && user.is_superuser==true),
      },
      {
        label: "Edit",
        key: "3",
        onClick: () => {
          setShowAdd(!showAdd);
          setSelectedData(detail);
        },
        visible: authorize.canUpdate("tobeinstructorrequest")&&
        (detail?.status === ActionStatusName.RequestSubmitted||detail?.status === ActionStatusName.RequestRejected
        )&&!user.is_superuser,
      },
      {
        label: (
          <Popconfirm
            title="Delete the Course"
            description="Are you sure to delete this Course?"
            onConfirm={() => deleteData(detail)}
            okText="Yes"
            cancelText="No"
          >
            delete
          </Popconfirm>
        ),
        key: "42",
        visible: authorize.canDelete("tobeinstructorrequest") &&
        (detail?.status === ActionStatusName.RequestSubmitted||detail?.status === ActionStatusName.RequestRejected)
        &&!user.is_superuser,
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
      <div className="container mx-auto ">
          
    

          <div>
            <div className="flex items-center justify-between">
            <SearchBar
              components={components}
              handleChange={paginator.handleChange}
              filteredData={paginator.filterData}
            />
            {
              !user.is_superuser&& 
                (currentPath === "/instructor_register"?(
                  data?.length<=0 && <div className="items-center">
                    <button onClick={()=>{setSelectedData(undefined);setShowAdd(true);}} className="w-20 h-10 hover:bg-custom_orange-800 rounded-md hover:text-white flex items-center justify-center">
                      <FaPlus className=""/>
                    
                    </button>  
                  </div>):(
                    <div className="items-center">
                    <button onClick={()=>{setSelectedData(undefined);setShowAdd(true);}} className="w-20 h-10 hover:bg-custom_orange-800 rounded-md hover:text-white flex items-center justify-center">
                      <FaPlus className=""/>
                    
                    </button>  
                  </div>
                  ))
              
            }
              
            </div>
           

            <CustomTable
              rowSelection={rowSelection}
              columns={tutorsColumns}
              dataSource={data}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="id"
            />
            <Pagination
              className={`pagination-bar mt-3 ${
                data?.length === 0 ? "hidden" : ""
              }`}
              {...paginator}
            />

            <Modal
              open={showAdd}
              onCancel={onClose}
              footer={[]}
              width={window?.innerWidth < 768 ? "100%" : "80%"}
              height={window?.innerWidth < 768 ? "100%" : "80%"}
            >
              <ToBeInstructorRequestAdd
                searchDatas={searchDatas}
                itemDetail={selectedData}
                cancel={onClose}
              />
            </Modal>

            <Modal
              mask={false}
              title="Instructor Request"
              className="mt-20"
              centered
              destroyOnClose
              open={open}
              okText={"Close"}
              onOk={() => setOpen(false)}
              onCancel={() => {
                setOpen(false);
              }}
              width={1200}
            >
              <Profile userId={userDetailId} userListDetail={true} />
            </Modal>
          </div>
   
      </div>
    </>
  );
};

export default ToBeInstructorRequestList;
