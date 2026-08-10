import React, { useEffect, useState } from "react";
import { Avatar, Dropdown, Flex, MenuProps, Space, message } from "antd";
import CustomCard from "../../customs/custom-card/CustomCard";
import { assignOrsetNull } from "../../../utils/modal";
import { SearchComponentProps } from "../../commons/search-bar/search";
import {
  ContractStatus,
  ContractStatusWithLable,
  componentType,
} from "../../../types/Enums";
import useLoading from "../../customs/loading/LoadingHook";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import {
  ETutorContract,
  PartialETutorContract,
} from "../../../types/ETutorContractItem";
import { useETutorContractService } from "./ETutorContractService";
import { formatDateTime } from "../../../utils/date";
import CustomButton from "../../customs/custom-button/CustomButton";
import SmallLoading from "../../customs/loading/SmallLoading";
import CustomPopConfirm from "../../customs/custom-modals/CustomPopConfirm";
import useAuthorization from "../../account/auth/authorization";
import Link from "next/link";
import { FiMoreHorizontal } from "react-icons/fi";

export interface Props {
  navigateTo?: string;
  value: ETutorContract;
  searchDatas: () => void;
  url?: string;
}

const TutorContractCard = (props: Props) => {
  const user = useSelector((state: AppState) => state.user);
  const [data, setData] = useState<ETutorContract[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedData, setSelectedData] = useState<ETutorContract>();
  const [toBeDeleteId, setToBeDeleteId] = useState<string>("");
  const [destroyOnHide, setDestroyOnHid] = useState<boolean>(false);
  const loading = useLoading();
  const apiService = useETutorContractService();
  const authorization = useAuthorization();

  const deleteData = () => {
    loading.startLoading();
    apiService
      .deleteETutorContract(props.value)
      .then((value) => {
        setData(value.data.results);
        props.searchDatas();
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
        props.searchDatas();
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
        props.searchDatas();
        setDestroyOnHid(true);
        loading.stopLoading();
        message.success("Successfully reject!");
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <>
          {props.value?.status === ContractStatus.REQUESTED ? (
            <>
              <Flex gap="small" vertical>
                <Flex gap="small" wrap="wrap">
                  <CustomButton
                    text="Approve Request"
                    fun={() => handleETutorContractApprove(props.value.id)}
                    className="custom-button"
                    is_loading={<SmallLoading {...loading} />}
                  />
                </Flex>
              </Flex>
            </>
          ) : (
            <></>
          )}
        </>
      ),
      key: "0",
    },

    {
      label: (
        <>
          {props.value?.status === ContractStatus.ACCEPTED ? (
            <>
              <Flex gap="small" vertical>
                <Flex gap="small" wrap="wrap">
                  <CustomButton
                    text="Terminate"
                    fun={() =>
                      handleETutorContractApprove(
                        props.value.id,
                        ContractStatus.TERMINATED
                      )
                    }
                    className="custom-button-disabled"
                  />
                </Flex>
              </Flex>
            </>
          ) : (
            <></>
          )}
        </>
      ),
      key: "5",
    },

    {
      label: (
        <>
          {props.value?.status === ContractStatus.ACCEPTED ? (
            <>
              <Flex gap="small" vertical>
                <Flex gap="small" wrap="wrap">
                  <CustomButton
                    text="Sespend"
                    fun={() =>
                      handleETutorContractApprove(
                        props.value.id,
                        ContractStatus.SUSPEND
                      )
                    }
                    className="custom-button-disabled"
                  />
                </Flex>
              </Flex>
            </>
          ) : (
            <></>
          )}
        </>
      ),
      key: "6",
    },

    {
      label: (
        <>
          {props.value?.status === ContractStatus.TERMINATED ? (
            <Flex gap="small" vertical>
              <Flex gap="small" wrap="wrap">
                <CustomButton
                  text="Approve Request"
                  fun={() => handleETutorContractApprove(props.value.id)}
                  className="custom-button"
                  is_loading={<SmallLoading {...loading} />}
                />
              </Flex>
            </Flex>
          ) : (
            <></>
          )}
        </>
      ),
      key: "7",
    },
    {
      label: (
        <>
          {props.value?.status === ContractStatus.SUSPEND ? (
            <Flex gap="small" vertical>
              <Flex gap="small" wrap="wrap">
                <CustomButton
                  text="Approve Request"
                  fun={() => handleETutorContractApprove(props.value.id)}
                  className="custom-button"
                  is_loading={<SmallLoading {...loading} />}
                />
              </Flex>
            </Flex>
          ) : (
            <></>
          )}
        </>
      ),
      key: "8",
    },
  ];

  const checkRequest = () => {
    data?.forEach((val) => {
      if (val.status === ContractStatus.ACCEPTED) {
        return false;
      }
    });
    return true;
  };

  const onFinish = (items: PartialETutorContract) => {
    handleETutorContractReject(toBeDeleteId, items);
  };

  const onFinishFailed = (errorInfo: any) => {};

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
      default: ContractStatus.REQUESTED,
    },
  ];

  useEffect(() => {
    // IsWindowUndefined() && window?.location.pathname
  }, []);

  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 p-3">
      <CustomCard
        className={` border shadow-md relative h-full ${
          selectedData?.id === props.value.id && " border-custom_orange-900 "
        } `}
      >
        {props.value.status === ContractStatus.REQUESTED &&
        props.value.user === user.id ? (
          <CustomPopConfirm func={deleteData} />
        ) : (
          ""
        )}
        <div className="flex flex-col items-center justify-between w-full lg:flex-row text-wrap hover:cursor-pointer hover:text-black">
          <div className="flex ">
            <div className="w-40 h-40 mr-4">
              <Link href={`${props.url}/${props.value.id}`}>
                {props.value.profile_picture ? (
                  <Avatar
                    src={props.value.profile_picture}
                    shape="square"
                    className="w-full h-full"
                  />
                ) : (
                  <Avatar
                    src="/profile_avatar.jpg"
                    shape="square"
                    className="w-full h-full"
                  />
                )}
              </Link>
            </div>
          </div>
          <div
            className="flex flex-col items-center pr-6 lg:mt-0 "
            onClick={() => {
              if (
                props.value?.status === ContractStatus.REQUESTED &&
                props.value?.user === user.id
              ) {
                setShowAdd(!showAdd);
                assignOrsetNull(setSelectedData, selectedData, props.value);
              }
            }}
          >
            <h3 className="self-start text-base">
              <span className="font-bold">Student Name: </span>{" "}
              {props.value?.student_first_name} {props.value?.student_last_name}
            </h3>
            <h3 className="self-start text-base">
              <span className="font-bold"> Tutor Name:</span>{" "}
              {props.value?.tutor_name}
            </h3>
            <h3 className="self-start text-base">
              <span className="font-bold"> Subject:</span>{" "}
              {props.value?.student_subject}
            </h3>
            <h3 className="self-start text-base">
              <span className="font-bold"> Grade:</span>{" "}
              {props.value?.student_level}
            </h3>
            <h3 className="self-start text-base">
              <span className="font-bold"> Location:</span>{" "}
              {props.value?.student_location}
            </h3>

            <p className="m-0 text-sm italic">
              Started at: {formatDateTime(props.value?.payment_date)}
            </p>
            <Flex gap="small" wrap="wrap" className="w-full justify-end">
              {/* <Button
                  className="custom-button"
                  disabled={!props.value.status ? false : true}
                  loading={loading.loading}
                > */}
              <span className="font-semibold text-base">
                {props.value?.status === ContractStatus.REQUESTED
                  ? "Request Submitted"
                  : props.value?.status === ContractStatus.ACCEPTED
                  ? "Request Approved"
                  : props.value?.status === ContractStatus.REJECTED
                  ? "Request Rejected"
                  : props.value?.status === ContractStatus.TERMINATED
                  ? "Request TERMINATED"
                  : props.value?.status === ContractStatus.SUSPEND
                  ? "Request SUSPEND"
                  : ""}
              </span>
            </Flex>
          </div>
          <div className="flex flex-col md:flex-row">
            {/* <div className="">
                  {handleRequestStatusJsx(props.value)}
            </div> */}
            <div className="absolute top-2 right-2">
              {/* {
                user.is_superuser ?
                  <CustomButton text='View Detail' className='custom-button' fun={() => {setOpen(true);}} />
                :""
              } */}
              {authorization.otherAction("etutorcontract") ? (
                <Dropdown menu={{ items }}>
                  <Space>
                    <FiMoreHorizontal className="font-bold text-lg" />
                  </Space>
                </Dropdown>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default TutorContractCard;
