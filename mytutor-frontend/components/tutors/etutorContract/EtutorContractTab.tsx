"use client";
import { Tabs, TabsProps } from "antd";
import TutorContractDetail from "./ETutorContractDetail";
import AttendanceList from "../attendance/AttendanceList";
import PaymentList from "../finance/payment/PaymentList";
import { IsWindowUndefined } from "@/utils/func_utils";

export interface Props {
  navigateTo?: string;
}

const TutorContractTab = () => {
  const items: TabsProps["items"] = [
    {
      key: "contract",
      label: "Tutor Contract",
      children: <TutorContractDetail />,
    },
    {
      key: "attendance",
      label: "Attendance",
      children: <AttendanceList />,
    },
    {
      key: "payment",
      label: "Payment",
      children: <PaymentList />,
    },
  ];

  return (
    <div className="mb-[150px]">
      <Tabs
        destroyInactiveTabPane
        className="items-center w-full learning"
        defaultActiveKey={
          IsWindowUndefined() ? window?.location.hash.slice(1) : ""
        }
        items={items}
      />
    </div>
  );
};

export default TutorContractTab;
