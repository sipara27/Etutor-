"use client";
import { useForm } from "react-hook-form";
import usePaymentService from "./usePaymentService";
import useAttendanceService, {
  AttendanceTableSearchModel,
} from "../../attendance/AttendanceService";
import { useEffect, useState } from "react";
import { usePagination } from "@/components/customs/pagination/usePagination";
import SearchBar from "@/components/commons/search-bar/SearchBar";
import { SearchComponentProps } from "@/components/commons/search-bar/search";
import { componentType } from "@/utils/common_models/commons.model";
import { Attendance } from "@/types/Attendance";
import CustomTable from "@/components/commons/Table/Table";
import { ColumnsType } from "antd/es/table";
import { toDate, toTime } from "@/utils/timeUtils";
import { ETutorContract } from "@/types/ETutorContractItem";
import { eth_currency, hour } from "@/utils/stringUtils";
import CustomButton from "@/components/customs/custom-button/CustomButton";
import { AttendanceStatus } from "@/types/Enums";
import AttendanceApproval from "../../attendance/AttendanceApproval";
import { Modal, message } from "antd";
import useAttendanceApprovalModal from "../../attendance/useAttendaceApprovalModal";
import { add, convertToTwoDecimals, divide, sub } from "@/utils/numUtils";

interface Props {
  contract: ETutorContract;
  cancel: () => void;
  searchPayment: () => void;
}

const PaymentGenerate = (props: Props) => {
  const attendanceService = useAttendanceService();
  const paymentService = usePaymentService();
  const [attendanceDatas, setAttendanceDatas] = useState<Attendance[]>([]);
  const approvalForm = useForm<Attendance>();
  const [open, setOpen] = useState(false);
  const paginator = usePagination<AttendanceTableSearchModel>({
    tutor_contract: props.contract.id,
    method: "generate_payment",
  });

  const getDuration = (
    starting_hour: Date | string,
    ending_hour: Date | string
  ) => {
    return convertToTwoDecimals(
      divide(
        sub(new Date(ending_hour).getTime(), new Date(starting_hour).getTime()),
        3600000
      )
    );
  };
  const onSubmit = () => {
    const end_date = (paginator.filterData as any).end_date;
    const contractId = props.contract.id;
    const data = end_date
      ? {
          tutor_contract: contractId,
          end_date: end_date,
        }
      : {
          tutor_contract: contractId,
        };
    paymentService.paymentsDo("generate_payment", data).then((data) => {
      message.success("Payment is successfully generated");
      props.cancel();
      props.searchPayment();
    });
  };
  const components: SearchComponentProps[] = [
    {
      placeholder: "End Date",
      key: "end_date",
      type: componentType.DATE,
    },
  ];

  const columns: ColumnsType<Attendance> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (_, { id, starting_hour }) => (
        <div className="flex items-center gapx-5">
          <div>{toDate(starting_hour)}</div>
        </div>
      ),
    },
    {
      title: "Starting Hour",
      dataIndex: "starting_hour",
      key: "starting_hour",
      render: (_, { id, starting_hour }) => (
        <div className="flex items-center gapx-5">
          <div>{toTime(starting_hour)}</div>
        </div>
      ),
    },
    {
      title: "Ending Hour",
      dataIndex: "ending_hour",
      key: "ending_hour",
      render: (_, { id, ending_hour }) => (
        <div className="flex items-center gapx-5">
          <div>{toTime(ending_hour)}</div>
        </div>
      ),
    },
    {
      title: "Total Hour",
      dataIndex: "total_hour",
      key: "total_hour",
      render: (_, { starting_hour, ending_hour }) => (
        <div className="flex items-center gapx-5">
          <div>{getDuration(starting_hour, ending_hour)}</div>
        </div>
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      render: (_, { starting_hour, ending_hour }) => (
        <span>
          {getDuration(starting_hour, ending_hour) * props.contract.hourly_rate}
          {eth_currency}
        </span>
      ),
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_, data) => (
        <span>
          {data.status == AttendanceStatus.SUBMITTED && (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setOpen(true);
                  approvalForm.reset(data);
                }}
                className="bg-custom_orange-700 rounded-md text-white px-2"
              >
                Response
              </button>
            </div>
          )}
        </span>
      ),
    },
  ];

  useEffect(() => {
    searchAttendance();
  }, [paginator.filterData]);

  const searchAttendance = () => {
    attendanceService
      .getAttendances(paginator.filterData)
      .then(({ data: values }) => {
        setAttendanceDatas(values.results);
      });
  };

  const onCancel = () => {
    setOpen(false);
  };

  const attendanceApproval = useAttendanceApprovalModal({
    searchAttendance: searchAttendance,
    setIsApprovalModalOpen: setOpen,
    isApprovalModalOpen: open,
    handleApprovalCancel: onCancel,
    approvalForm: approvalForm,
  });

  return (
    <>
      <h1 className="text-2xl font-bold">Un-paid Attendance List</h1>
      <div className="py-4 text-lg font-medium flex justify-evenly">
        <div>
          Hourly Rate: {props.contract.hourly_rate}
          {eth_currency}
        </div>
        <div>Tutor Name: {props.contract.tutor_name}</div>
      </div>
      <SearchBar
        components={components}
        handleChange={paginator.handleChange}
        filteredData={paginator.filterData}
      />

      <CustomTable
        header="starting_hour"
        columns={columns}
        dataSource={attendanceDatas}
        pagination={false}
        footer={() => {
          return <></>;
        }}
      />

      {attendanceDatas.length > 0 && (
        <div className="w-full flex flex-col font-bold">
          <span className="ml-auto pr-20">
            Total Hour:
            <span className="underline font-normal">
              {attendanceDatas.reduce(
                (prev, curr) =>
                  add(prev, getDuration(curr.starting_hour, curr.ending_hour)),
                0
              )}
              {hour}
            </span>
          </span>
          <span className="ml-auto pr-20">
            Grand Total:
            <span className="underline font-normal">
              {attendanceDatas.reduce(
                (prev, curr) =>
                  add(
                    prev,
                    getDuration(curr.starting_hour, curr.ending_hour) *
                      props.contract.hourly_rate
                  ),
                0
              )}{" "}
              {eth_currency}
            </span>
          </span>
          {attendanceDatas.some(
            (val) => val.status == AttendanceStatus.SUBMITTED
          ) ? (
            <div className="text-custom_orange-700">
              Please give response for submitted Attendance!
            </div>
          ) : (
            <CustomButton
              className="w-fit"
              text="Generate Payment"
              fun={onSubmit}
            />
          )}
        </div>
      )}
      <Modal {...attendanceApproval}>
        <AttendanceApproval approvalForm={approvalForm} />
      </Modal>
    </>
  );
};

export default PaymentGenerate;
