import { useEffect, useState, useRef } from "react";
import Loading from "../../customs/loading/Loading";
import useLoading from "../../customs/loading/LoadingHook";
import { FaEllipsisV, FaPlus, FaRedo, FaTrashAlt } from "react-icons/fa";
import CustomCard from "../../customs/custom-card/CustomCard";
import { assignOrsetNull } from "../../../utils/modal";
import { useOutletContext } from "react-router-dom";
import { Avatar, Button, Checkbox, Dropdown, Empty, message, Modal, Pagination, Table, Tag, Tooltip } from "antd";
import useSubjectService, { Subject, SubjectTableSearchModel } from "./SubjectService";
import ListHeader from "@/components/commons/ListHeader";
import { SearchComponentProps } from "@/components/commons/search-bar/search";
import { componentType, ContractStatusWithLable, ContractStatus } from "@/types/Enums";
import { ETutorContract } from "@/types/ETutorContractItem";
import { formatDateTime } from "@/utils/date";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { TableRowSelection } from "antd/es/table/interface";
import useAuthorization from "@/components/account/auth/authorization";
import { usePagination } from "@/components/customs/pagination/usePagination";
import { data } from "@/component/course/InstructorDashboard";
import SearchBar from "@/components/commons/search-bar/SearchBar";
import CustomTable from "@/components/commons/Table/Table";
import SubjectAdd from "./SubjectAdd";

interface Props {
  data: Subject[];
}

function SubjectList(props: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedData, setSelectedData] = useState<Subject>();
  const [addNew, setAddNew] = useState(false);
  const subjectservice = useSubjectService();
  const hasFetchedRef = useRef(false); // Prevent duplicate calls

  const loading = useLoading();
  const context: any = useOutletContext();
  const [openDeleteModal, setDeleteOpenModel] = useState(false);
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState("Are you sure you want to delete");

  const authorize = useAuthorization();

  const paginator = usePagination<SubjectTableSearchModel>(
    {
      ps: 5,
    });

  const deleteSubject = async () => {
    if (selectedData) {
      setSelectedData(undefined);
      subjectservice.deleteSubject(selectedData.id).then((value) => {
        searchSubjects();
        setDeleteOpenModel(false);
        message.success("Successfully deleted!")
      });
    }
  };

  const onClose = () => {
    setAddNew(false);
    setSelectedData(undefined);
    searchSubjects();
  };
  useEffect(() => {
    context?.setTitle("Subjects");
  }, []);

  // Use data prop if provided, otherwise fetch (only once)
  useEffect(() => {
    if (props.data && props.data.length > 0) {
      setSubjects(props.data);
      paginator.setTotal(props.data.length);
    } else if (!hasFetchedRef.current) {
      // Only fetch once to prevent duplicate calls
      hasFetchedRef.current = true;
      searchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchSubjects = () => {
    loading.startLoading();
    subjectservice
      .getSubjects()
      .then(({ data: result }) => {
        setSubjects(result.results);
        loading.stopLoading();
        paginator.setTotal(result.results.length);
        hasFetchedRef.current = true;
      })
      .catch((error) => loading.stopLoading());
  };

  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    }
  ]

  const subjectColumn: ColumnsType<Subject> = [
    {
      title: "Serial No.",
      dataIndex: "serial_number",
      key: "serial_number",
      sorter: true,
      className: "w-[130px]",
      render: (_, { serial_number }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">
              {serial_number}
            </div>
          </div>
        </>
      ),
    }, {
      title: "Subject",
      dataIndex: "subject_name",
      sorter: true,
      key: "subject_name",
      render: (_, data) => (
        <>
          <div className="flex-col gap-x-4 hidden sm:block">
            <div className="font-semibold">{`${data.subject_name}`}</div>
          </div>
          <div className="gap-x-4 sm:hidden flex-col">
            <div className="font-semibold flex gap-1 items-center">
              <a className="text-sm mb-0 font-semibold">Subject:</a>
              <span className="font-thin text-xs">{data.subject_name}</span>
            </div>

            <div className="font-semibold flex gap-1 items-center">
              <a className="text-sm mb-0 font-semibold">Serail No:</a>
              <span className="font-thin text-xs">{data.serial_number}</span>
            </div>

            <div className="font-semibold flex gap-1 items-center">
              <a className="text-sm mb-0 font-semibold">Description:</a>
              <span className="font-thin text-xs">{data.description}</span>
            </div>

          
          </div>
        </>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: true,
      render: (_, { description, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="">
              {description}
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
    }

  ];
  const renderMenuItem = (detail: Subject) => {
    const items = [
      {
        label: "Edit",
        key: "5",
        onClick: () => { setSelectedData(prv=>detail); setAddNew(true) },
        visible: authorize.canUpdate("subject"),
      },
      {
        label: "Delete",
        key: "6",
        onClick: () => { setSelectedData(detail); setDeleteOpenModel(true) },
        visible: authorize.canUpdate("subject"),
      }
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
      <Loading {...loading} />
      <div className="container mx-auto px-5 ">
        <ListHeader title="Subjects" addTitle="Add Subject" add={() => setAddNew(!addNew)} load={searchSubjects} />

        {subjects?.length === 0 ? (
          <Empty className="flex justify-center w-full" />
        ) : (
          <div>
            <SearchBar
              components={components}
              handleChange={paginator.handleChange}
              filteredData={paginator.filterData}
            />

            <CustomTable
              rowSelection={rowSelection}
              columns={subjectColumn}
              dataSource={subjects}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="subject_name"
            />
            <Pagination
              className={`pagination-bar mt-3 ${subjects?.length === 0 ? "hidden" : ""
                }`}
              {...paginator}
            />

          </div>

        )}
      </div >
      {addNew && <Modal
        open={addNew}
        onCancel={onClose}
        footer={[]}
        className="mt-32"
        width={window?.innerWidth < 768 ? "90%" : "40%"}
        height={window?.innerWidth < 768 ? "90%" : "40%"}
      >
        <SubjectAdd
          getSubject={() => { searchSubjects }}
          cancel={onClose}
          detail={selectedData}
        />
      </Modal>

      }

      <Modal
        title="Confirm Subject Delete?"
        open={openDeleteModal}
        onOk={deleteSubject}
        onCancel={() => setDeleteOpenModel(false)}
        okText="Yes"
        cancelText="No"
        className="mt-32"
      >
        <p>{`Are you sure you want to delete subject: ${selectedData?.subject_name}`}</p>
      </Modal>

    </>
  );
}
export default SubjectList;
