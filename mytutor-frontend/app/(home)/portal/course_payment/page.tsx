"use client";
import {
  Dropdown,
  List,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Table,
  Tag,
} from "antd";
import { Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { componentType } from "@/utils/common_models/commons.model";
import { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import {
  CoursePaymentType,
  CoursePaymentTypeSearchModel,
} from "./CoursePayment.model";
import { usePagination } from "@/components/customs/pagination/usePagination";
import useCoursePaymentService from "./useCoursePayment";
import useAuthorization from "@/components/account/auth/authorization";
import { SearchComponentProps } from "@/components/commons/search-bar/search";
import { getLabelByValue } from "@/utils/array";
import {
  ContractStatus,
  PaymentStatus,
  paymentStatusOption,
} from "@/types/Enums";
import SearchBar from "@/components/commons/search-bar/SearchBar";
import CustomTable from "@/components/commons/Table/Table";
import useTranslation from "@/utils/translation";
import ListHeader from "@/components/commons/ListHeader";
import { eth_currency } from "@/utils/stringUtils";
import { AppState } from "@/state/store/store";
import { useSelector } from "react-redux";
import CoursePaymentReceiptAdd from "./CoursePaymentReceiptAdd";
import {
  FaBook,
  FaDownload,
  FaMoneyBill,
  FaPiggyBank,
  FaReceipt,
} from "react-icons/fa";
import useEnrollmentService from "@/components/courses/course/EnrollmentService";
import { BiSolidBank } from "react-icons/bi";
import useBankService from "@/components/tutors/bank/BankService";
import { Bank } from "@/types/BankItem";
import ViewBanksList from "@/components/tutors/bank/viewBanks";

export default function CoursePaymentList() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { translate } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coursepaymentData, setCoursePaymentData] = useState<
    CoursePaymentType[]
  >([]);
  const [selectedData, setSelectedData] = useState<CoursePaymentType>();
  const [viewBanks, setViewBanks] = useState<boolean>(false);
  const [addNew, setAddNew] = useState(false);
  const coursepaymentService = useCoursePaymentService();
  const paginator = usePagination<CoursePaymentTypeSearchModel>({ps:5});
  const user = useSelector((state: AppState) => state.user);
  const authorize = useAuthorization();
  const enrollmentService = useEnrollmentService();

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<CoursePaymentType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const deleteCoursePayment = (id: string) => {
    coursepaymentService.deleteCoursePayment(id).then(() => {
      searchCoursePayment();
    });
  };

  const updateCoursePayment = (item: CoursePaymentType) => {
    // if (editRef.current) {
    //   editRef.current.edit(item);
    // }
  };

  useEffect(() => {
    authorize.requireRead("coursepayment");
    searchCoursePayment();
  }, [paginator.filterData]);

  const searchCoursePayment = () => {
    coursepaymentService
      .getCoursePayments(paginator.filterData)
      .then((values) => {
        setCoursePaymentData(values.results);
        paginator.setTotal(values.count);
      });
  };

  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
  ];

  const refundPayment = (data: CoursePaymentType) => {
    coursepaymentService
      .coursepaymentDetailDo(data.id, "refund", data)
      .then((value) => {
        message.success("successfully refunded");
        searchCoursePayment();
      });
  };

  const approvePayment = (data: CoursePaymentType) => {
    coursepaymentService
      .coursepaymentDetailDo(data.id, "approve", data)
      .then((value) => {
        if (value) {
          handleEnrollment(data);
          message.success("successfully approve");
          searchCoursePayment();
        }
      });
  };

  const cashPayment = (data: CoursePaymentType) => {
    coursepaymentService
      .coursepaymentDetailDo(data.id, "cash", data)
      .then((value) => {
        message.success("successfully approve");
        searchCoursePayment();
      });
  };

  const cancelPayment = (data: CoursePaymentType) => {
    coursepaymentService
      .coursepaymentDetailDo(data.id, "cancel", data)
      .then((value) => {
        message.success("successfully cancelled");
        searchCoursePayment();
      });
  };
  const handleEnrollment = (detail: CoursePaymentType) => {
    const data = { course: detail.course, user: detail.student };
    enrollmentService.addCourseEnrollment(data).then((data) => {
      message.success("Student is successfully enrolled.");
    });
  };

  const renderMenuItem = (detail: CoursePaymentType) => {
    const items = [
      {
        label: translate("edit"),
        key: "1",
        onClick: () => updateCoursePayment(detail),
        visible:
          authorize.canUpdate("coursepayment") && user.id === detail.student,
      },
      {
        label: (
          <Popconfirm
            placement="topLeft"
            title="Are you Sure you want to refund it?"
            onConfirm={(e) => {
              refundPayment(detail);
            }}
          >
            {translate("refund")}
          </Popconfirm>
        ),
        key: "1",
        visible:
          detail.status === PaymentStatus.PAID &&
          authorize.otherAction("coursepayment") &&
          user.id !== detail.student,
      },
      {
        label: (
          <Popconfirm
            placement="topLeft"
            title="Are you Sure you want to approve it?"
            onConfirm={(e) => {
              approvePayment(detail);
            }}
          >
            {translate("approve")}
          </Popconfirm>
        ),
        key: "1",
        visible:
          detail.status === PaymentStatus.NEED_APPROVAL &&
          authorize.otherAction("coursepayment") &&
          user.id !== detail.student,
      },
      {
        label: (
          <Popconfirm
            placement="topLeft"
            title="Are you Sure you want to paid it?"
            onConfirm={(e) => {
              cashPayment(detail);
            }}
          >
            {translate("cash")}
          </Popconfirm>
        ),
        key: "1",
        visible:
          detail.status === PaymentStatus.NOT_PAID &&
          authorize.otherAction("coursepayment") &&
          user.id !== detail.student,
      },

      {
        label: (
          <Popconfirm
            placement="topLeft"
            title="Are you Sure you want to cancel it?"
            onConfirm={(e) => {
              cancelPayment(detail);
            }}
          >
            {translate("cancel")}
          </Popconfirm>
        ),
        key: "2",
        visible:
          detail.status === PaymentStatus.NOT_PAID &&
          authorize.otherAction("coursepayment") &&
          user.id !== detail.student,
      },
      {
        label: (
          <Popconfirm
            title="Delete the Course Payment"
            description="Are you sure to delete this course payment?"
            onConfirm={() => deleteCoursePayment(detail.id)}
            okText="Yes"
            cancelText="No"
          >
            {translate("delete")}
          </Popconfirm>
        ),
        key: "2",
        visible:
          authorize.canDelete("coursepayment") &&
          user.id === detail.student &&
          detail.status === PaymentStatus.NOT_PAID,
      },
    ];

    return items.filter((item) => item.visible != false);
  };

  const actionStatusTag = (status: number) => {
    return (
      <div className="">
        {status === PaymentStatus.NOT_PAID ? (
          <Tag color="success">Not Paid</Tag>
        ) : status === PaymentStatus.NEED_APPROVAL ? (
          <Tag color="processing">Need Approval</Tag>
        ) : status === PaymentStatus.PAID ? (
          <Tag color="blue">Payment Approved</Tag>
        ) : status === PaymentStatus.CANCLLED ? (
          <Tag color="error">Payment Cancelled</Tag>
        ) :(
          <Tag color="warning">Payment Refunded</Tag>
        ) }
      </div>
    );
  };
  const pay = (data: CoursePaymentType) => {
    onSelectData(data);
  };

  const viewBankLists = () => {
    setViewBanks(true);
  };
  const coursepaymentColumns: ColumnsType<CoursePaymentType> = [
    {
      title: "Student",
      dataIndex: "student",
      sorter: true,
      key: "id",
      render: (_, data) => (
        <>
          <div className="flex-col gap-x-4 max-sm:hidden">
            <div className="font-semibold">{data.student_name}</div>
          </div>
          <div className="md:hidden gap-x-4 mb-5 mr-10">
            <h1 className="font-semibold text-lg mb-10">{data.student_name}</h1>
            <div className="text-gray-500 flex space-x-2">
              <FaBook className="text-blue-400" />
              <span>{data.course_name}</span>
            </div>
            {data.bank_name && (
              <div className="text-gray-500 flex space-x-2">
                <BiSolidBank className="text-blue-400" />
                <span>
                  {data.bank_name}({data.bank_account_number})
                </span>
              </div>
            )}
            {data.bank_account_number && (
              <div className="text-gray-500 flex space-x-2">
                <FaReceipt className="text-blue-400" />
                <span>{data.reference_no}</span>
              </div>
            )}
            <div className="text-gray-500 flex space-x-2">
              <FaMoneyBill className="text-blue-400" />
              <span>
                {data.total_price}
                {eth_currency}
              </span>
            </div>
            <div className="flex space-x-5 mt-10">
              <div className="text-normal text-gray-6F text-[12px]">
                {actionStatusTag(data.status as number)}
              </div>
              <div className="text-normal text-gray-6F text-[12px]">
                {data.payment_receipt_url && (
                  <a href={`${data.payment_receipt_url}`} target="_blank" className="h-[17px]">
                    <FaDownload className="text-sm w-6  text-blue-400" />
                  </a>
                )}{" "}
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Course",
      dataIndex: "course_name",
      key: "course_name",
      sorter: true,
    },
    {
      title: "Bank Name",
      dataIndex: "bank_name",
      key: "bank_name",
      sorter: true,
      render: (_, data) => (
        <>
          <div>
            <div className="text-normal text-gray-6F text-[12px]">
              {data.bank_name}{data.bank_account_number&&(data.bank_account_number)}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Reference",
      dataIndex: "reference_no",
      key: "reference_no",
      render: (_, data) => (
        <>
          <div>
            <div className="text-normal text-gray-6F text-[12px]">
              {data.reference_no}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Payment Receipt",
      dataIndex: "payment_receipt_url",
      key: "payment_receipt_url",
      render: (_, { payment_receipt_url }) => (
        <>
          {payment_receipt_url && (
            <a href={`${payment_receipt_url}`} target="_blank">
              <FaDownload className="text-gray-400 text-3xl w-10 p-2" />
            </a>
          )}
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total_price",
      key: "total_price",
      sorter: true,
      render: (_, { total_price }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {total_price}
              {eth_currency}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (_, { status }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {getLabelByValue(paymentStatusOption, status)}
            </div>
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
          <div className="flex max-md:flex-col gap-1">
            {detail.status === PaymentStatus.NOT_PAID &&
              authorize.otherAction("coursepayment") && (
                <>
                  <Button
                    className="max-sm:w-[85px]"
                    onClick={() => pay(detail)}
                  >
                    Pay
                  </Button>
                  <Button
                    className="max-sm:w-[85px] p-2 text-sm"
                    onClick={() => viewBankLists()}
                  >
                    View Banks
                  </Button>
                </>
              )}
            <Dropdown
              className="border-none"
              menu={{ items }}
              trigger={["click"]}
            >
              <Button>
                <MoreOutlined className="" size={200} />
              </Button>
            </Dropdown>
          </div>
        ) : (
          <></>
        );
      },
    },
  ];

  const onClose = () => {
    setAddNew(false);
    setSelectedData(undefined);
    setViewBanks(false);
  };

  const onSelectData = (data: CoursePaymentType) => {
    setAddNew(true);
    setSelectedData(data);
  };

  return (
    <div className="rounded-lg container mx-4 mt-4">
      <ListHeader title="Course Payment" />
      <SearchBar
        filteredData={paginator.filterData}
        components={components}
        handleChange={paginator.handleChange}
      />
      <CustomTable
        rowSelection={rowSelection}
        columns={coursepaymentColumns}
        dataSource={coursepaymentData}
        onChange={paginator.onSortChange}
        updateRowSelected={setSelectedRowKeys}
        pagination={false}
        rowKey="id"
        header="id"
      />
      <div className="flex items-center justify-end mt-4">
        <Pagination {...paginator} />
      </div>

      <Modal
        destroyOnClose
        open={addNew}
        width={800}
        onCancel={onClose}
        footer={[]}
      >
        <CoursePaymentReceiptAdd
          searchPayment={searchCoursePayment}
          detail={selectedData}
          cancel={onClose}
        />
      </Modal>
      <Modal
        destroyOnClose
        open={viewBanks}
        width={800}
        onCancel={onClose}
        footer={[]}
      >
        <ViewBanksList />
      </Modal>
    </div>
  );
}
