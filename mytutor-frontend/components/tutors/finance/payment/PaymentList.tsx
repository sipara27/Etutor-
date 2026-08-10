"use client";
import { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import CustomTable from "../../../customs/custom-components/CustomTable";
import {
  Button,
  Dropdown,
  Menu,
  Modal,
  Popconfirm,
  Table,
  Tag,
  message,
} from "antd";
import usePaymentService, {
  PaymentTableSearchModel,
  PaymentType,
} from "./usePaymentService";
import { useEffect, useState } from "react";
import { usePagination } from "../../../customs/pagination/usePagination";
import { getLabelByValue } from "../../../../utils/array";
import {
  componentType,
  ContractStatus,
  PaymentStatus,
  paymentStatusOption,
} from "../../../../types/Enums";
import { MoreOutlined } from "@ant-design/icons";
import useTranslation from "../../../../utils/translation";
import useAuthorization from "../../../account/auth/authorization";
import { SearchComponentProps } from "../../../commons/search-bar/search";
import SearchBar from "../../../commons/search-bar/SearchBar";
import PaymentAdd from "./PaymentAdd";
import CustomButton from "../../../customs/custom-button/CustomButton";
import {
  FaBook,
  FaDownload,
  FaMoneyBill,
  FaPlus,
  FaReceipt,
  FaUserTie,
} from "react-icons/fa";
import PaymentGenerate from "./PaymentGenerate";
import { useParams } from "next/navigation";
import { ETutorContract } from "@/types/ETutorContractItem";
import useETutorContractService from "../../etutorContract/ETutorContractService";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { toDate } from "@/utils/timeUtils";
import { eth_currency } from "@/utils/stringUtils";
import { BiSolidBank } from "react-icons/bi";
import ViewBanksList from "../../bank/viewBanks";

const PaymentList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [paymentRequestDatas, setPaymentRequestDatas] = useState<PaymentType[]>(
    []
  );
  const user = useSelector((state: AppState) => state.user);
  const [contract, setContract] = useState<ETutorContract>();
  const etutorContractService = useETutorContractService();
  const paginator = usePagination<PaymentTableSearchModel>({
    ps: 5,
  });
  const params = useParams();
  const [addNew, setAddNew] = useState(false);
  const [generatePayment, setGeneratePayment] = useState(false);
  const [selectedData, setSelectedData] = useState<PaymentType>();
  const authorize = useAuthorization();
  const paymentService = usePaymentService();
  const { translate } = useTranslation();
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [viewBanks, setViewBanks] = useState(false);

  const onClose = () => {
    setAddNew(false);
    setSelectedData(undefined);
    setViewBanks(false);
  };

  const onSelectData = (data: PaymentType) => {
    setAddNew(true);
    setSelectedData(data);
  };

  const handleGeneratePayment = () => {
    setGeneratePayment(true);
  };

  const rowSelection: TableRowSelection<PaymentType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  useEffect(() => {
    params.contractId &&
      etutorContractService
        .getETutorContract(params.contractId as string)
        .then(({ data: value }) => {
          setContract(value);
        });
  }, []);

  useEffect(() => {
    paymentSearch();
  }, [paginator.filterData]);

  const paymentSearch = () => {
    paymentService
      .getPayments({
        ...paginator.filterData,
        tutor_contract: params.contractId as string,
      })
      .then(({ data: value }) => {
        setPaymentRequestDatas(value.results);
      });
  };
  const showDetail = (data: PaymentType) => {};

  const pay = (data: PaymentType) => {
    onSelectData(data);
  };

  const refundPayment = (data: PaymentType) => {
    paymentService.paymentDo(data.id, "refund").then((value) => {
      message.success("successfully refunded");
      paymentSearch();
    });
  };

  const approvePayment = (data: PaymentType) => {
    paymentService.paymentDo(data.id, "approve").then((value) => {
      message.success("successfully approve");
      paymentSearch();
    });
  };

  const cashPayment = (data: PaymentType) => {
    paymentService.paymentDo(data.id, "cash").then((value) => {
      message.success("successfully approve");
      paymentSearch();
    });
  };

  const cancelPayment = (data: PaymentType) => {
    paymentService.paymentDo(data.id, "cancel").then((value) => {
      message.success("successfully cancelled");
      paymentSearch();
    });
  };

  const renderMenuItem = (detail: PaymentType) => {
    const items = [
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
          authorize.otherAction("paymentrequest"),
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
          authorize.otherAction("paymentrequest") &&
          (user.id !== detail.student || user.id !== detail.tutor),
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
          authorize.otherAction("paymentrequest"),
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
          authorize.otherAction("paymentrequest"),
      },
    ];

    return items.filter((item) => item.visible !== false);
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
        ) : (
          <Tag color="warning">Payment Refunded</Tag>
        )}
      </div>
    );
  };
  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
    {
      placeholder: "Status",
      key: "status",
      type: componentType.DROPDOWN,
      options: paymentStatusOption,
    },
  ];
  const viewBankLists = () => {
    setViewBanks(true);
  };
  const columns: ColumnsType<PaymentType> = [
    {
      title: "Student",
      dataIndex: "student_name",
      key: "student_name",
      render: (_, data) => (
        <>
          <div className="flex-col gap-x-4 max-sm:hidden">
            <div className="font-semibold">{data.student_name}</div>
          </div>
          <div className="md:hidden gap-x-4 mb-5 mr-10 max-sm:ml-5">
            <h1 className="font-semibold text-lg mb-10">{data.student_name}</h1>
            <div className="text-gray-500 flex space-x-2">
              <FaUserTie className="text-blue-400" />
              <span>{data.tutor_name}</span>
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

            <div className="text-normal text-gray-6F text-[12px]">
              {data.total_hour && "Total Hour: " + data.total_hour}
            </div>

            <div className="text-normal text-gray-6F text-[12px]">
              {data.hourly_rate && "Hourly Rate: " + data.hourly_rate}
            </div>
            <div className="flex space-x-5 mt-10">
              <div className="text-normal text-gray-6F text-[12px]">
                {actionStatusTag(data.status as number)}
              </div>
              <div className="text-normal text-gray-6F text-[12px]">
                {data.payment_receipt_url && (
                  <a
                    href={`${data.payment_receipt_url}`}
                    target="_blank"
                    className="h-[17px]"
                  >
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
      title: "Date",
      dataIndex: "create_date",
      key: "create_date",
      render: (_, { create_date }) => <span>{toDate(create_date)}</span>,
    },
    {
      title: "Tutor",
      dataIndex: "tutor",
      key: "tutor",
      render: (_, { tutor_name }) => (
        <>
          <div className="flex flex-col text-blue-600">
            <div>{tutor_name}</div>
          </div>
        </>
      ),
    },

    {
      title: "Total Price",
      dataIndex: "total_price",
      key: "total_price",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, { status }) => (
        <>
          <div className="flex flex-col ">
            <div>{getLabelByValue(paymentStatusOption, status)}</div>
          </div>
        </>
      ),
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
              {data.bank_name}
              {data.bank_account_number && data.bank_account_number}
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
          <div className="">
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
      title: "action",
      dataIndex: "action",
      key: "action",
      render: (_, data) => {
        const items = renderMenuItem(data);
        return (
          <div className="flex max-md:flex-col gap-1">
            {data.status === PaymentStatus.NOT_PAID &&
              authorize.otherAction("paymentrequest") && (
                <>
                  <Button className="max-sm:w-[85px]" onClick={() => pay(data)}>
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
            {items.length ? (
              <Dropdown
                className="border-none self-end"
                overlay={<Menu selectable={true} items={items} />}
              >
                <Button>
                  <MoreOutlined className="" size={200} />
                </Button>
              </Dropdown>
            ) : (
              <></>
            )}{" "}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div>
        <div className="flex items-baseline">
          <h1 className="flex-1 text-2xl font-semibold text-center">
            Payment List
          </h1>
          {params.contractId && contract?.student == user.id && (
            <div>
              <CustomButton
                text={
                  <div className="flex p-0 -mb-3  items-baseline gap-1">
                    <FaPlus size={12} />
                    <p className="text-white text-lg">Generate</p>
                  </div>
                }
                fun={handleGeneratePayment}
                className="px-10 mt-0"
              />
            </div>
          )}
        </div>
        <SearchBar
          components={components}
          handleChange={paginator.handleChange}
          filteredData={paginator.filterData}
        />
        <div className="px-2">
          <CustomTable
            rowSelection={rowSelection}
            columns={columns.filter((item) => item.className !== "hidden")}
            dataSource={paymentRequestDatas}
            pagination={false}
            rowKey="id"
            header="student_name"
          />
        </div>
      </div>

      <Modal open={addNew} width={800} onCancel={onClose} footer={[]}>
        <PaymentAdd
          searchPayment={paymentSearch}
          detail={selectedData}
          cancel={onClose}
        />
      </Modal>
      <Modal
        width={960}
        open={generatePayment}
        onCancel={() => setGeneratePayment(false)}
        footer={[]}
        destroyOnClose
      >
        {contract && (
          <PaymentGenerate
            searchPayment={paymentSearch}
            contract={contract}
            cancel={() => setGeneratePayment(false)}
          />
        )}
      </Modal>
      <Modal
        destroyOnClose
        open={viewBanks}
        width={600}
        onCancel={onClose}
        footer={[]}
      >
        <ViewBanksList />
      </Modal>
    </>
  );
};

export default PaymentList;
