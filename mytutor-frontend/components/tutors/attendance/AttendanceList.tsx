"use client";
import React, { useState } from "react";
import Calendar from "../../customs/calendar/Calendar";
import { Button, Modal, Popconfirm } from "antd";
import AttendanceAdd from "./AttendanceAdd";
import CustomText from "../../customs/custom-text/CustomText";
import AttendanceApproval from "./AttendanceApproval";
import DebounceSelect from "../../customs/custom-input/DebounceSelect";
import { LabeledValue } from "antd/es/select";
import useUserService from "../../account/user/UserService";
import useAttenaceList from "./useAttendanceList";
import useAttendanceApprovalModal from "./useAttendaceApprovalModal";

const AttendanceList: React.FC = () => {
  const userService = useUserService();

  async function fetchUserList(name: string): Promise<LabeledValue[]> {
    return userService
      .getUsers({ search: name, method: "tutor_user" })
      .then(({ data: response }) => {
        return response.results.map((resp) => ({
          label: `${resp.short_name}`,
          value: resp.id,
        }));
      });
  }

  const [value, setValue] = useState<LabeledValue[]>([]);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const attendanceList = useAttenaceList();
  const attendanceApproval = useAttendanceApprovalModal({
    searchAttendance: attendanceList.searchAttendance,
    setIsApprovalModalOpen: attendanceList.setIsApprovalModalOpen,
    isApprovalModalOpen: attendanceList.isApprovalModalOpen,
    handleApprovalCancel: attendanceList.handleApprovalCancel,
    attendanceForm: attendanceList.attendanceForm,
    showModal: attendanceList.showModal,
    approvalForm: attendanceList.approvalForm,
  });
  return (
    <div>
      {!attendanceList.params.contractId && (
        <h1 className="font-bold text-base">Attendance List</h1>
      )}
      <div className="h-[85vh] mb-4">
        <Calendar
          onRangeChange={attendanceList.handleRangeChange}
          defaultView={"month"}
          onSelectEvent={attendanceList.handleSelectEvent}
          onSelectSlot={attendanceList.handleSelectSlot}
          selectable
          events={attendanceList.events}
          isFirst={isFirst}
          setIsFirst={setIsFirst}
          tooltipAccessor={'' as any}
        >
          {
            <div className="space-x-2">
              {!attendanceList.params.contractId && (
                <DebounceSelect
                  mode="multiple"
                  value={value}
                  placeholder="Select Student"
                  fetchOptions={fetchUserList}
                  onChange={(newValue) => {
                    setValue(newValue as LabeledValue[]);
                    const val = newValue as LabeledValue[];
                    attendanceList.setFiltredData({
                      ...attendanceList.filteredData,
                      student: val.length
                        ? (val[0].value as string)
                        : undefined,
                    });
                  }}
                  className="w-96"
                />
              )}
              {attendanceList.selectedAttendance.length ? (
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    onClick={attendanceList.approveSelected}
                  >
                    Approve
                  </Button>
                  <Button
                    type="primary"
                    className="!bg-red-600"
                    onClick={attendanceList.rejectSelected}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          }
        </Calendar>
      </div>
      {/* <div className="mr-2 py-5 grid font-semibold grid-cols-3 w-fit  gap-y-2 gap-x-4">
        <div className="col-span-3 text-base pl-16 mb-2 font-bold underline">Legend</div>
        <div className="bg-[#FFCB11]  inline w-20 h-4"/>
        <div className="col-span-2"> Submitted </div>
        <div className="bg-[#ED1406]  inline w-20 h-4" />
        <div className="col-span-2"> Rejected </div>
        <div className="bg-[#9DD993]  inline w-20 h-4" />
        <div className="col-span-2"> Accepted </div>
        <div className="bg-[#1BA804]  inline w-20 h-4" />
        <div className="col-span-2"> Merged From other contract </div>
        <div className="bg-[#DAD7B9]  inline w-20 h-4" />
        <div className="col-span-2"> Contract Not started </div>

      </div> */}
      <Modal
        title={
          <h1 className="my-2 text-2xl text-center">
            Add <CustomText text="Attendance" />
          </h1>
        }
        open={attendanceList.isModalOpen}
        onOk={attendanceList.attendanceForm.handleSubmit(
          attendanceList.onSubmit
        )}
        onCancel={attendanceList.handleCancel}
        footer={[
          <div
            key={attendanceList.attendanceForm.getValues().id}
            className="flex gap-2 w-full justify-between"
          >
            {attendanceList.attendanceForm.getValues().id ? (
              <Popconfirm
                title="Are you share to delete the attendance?"
                onConfirm={attendanceList.handleDelete}
              >
                <span className="px-4 py-1 border-r-4 font-medium border border-gray-400 border-solid text-black">
                  Delete
                </span>{" "}
              </Popconfirm>
            ) : (
              <span></span>
            )}

            <div className="flex gap-2">
              <button
                className="w-24 h-8 border-r-4 font-medium border border-gray-400 border-solid text-black"
                onClick={attendanceList.handleCancel}
              >
                Cancel
              </button>
              <button
                className="w-16 bg-custom_orange-900 h-8 text-white border-r-4 font-medium border border-solid"
                onClick={attendanceList.attendanceForm.handleSubmit(
                  attendanceList.onSubmit
                )}
              >
                Ok
              </button>
            </div>
          </div>,
        ]}
      >
        <AttendanceAdd attendanceForm={attendanceList.attendanceForm} />
      </Modal>
      <Modal {...attendanceApproval}>
        <AttendanceApproval approvalForm={attendanceList.approvalForm} />
      </Modal>
    </div>
  );
};

export default AttendanceList;
