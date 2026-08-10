"use client";

import {  useEffect, useState, useRef } from "react";
import Loading from "../../customs/loading/Loading";
import useLoading from "../../customs/loading/LoadingHook";
import { FaEllipsisV, FaPlus, FaRedo, FaTrashAlt } from "react-icons/fa";
import CustomCard from "../../customs/custom-card/CustomCard";
import { assignOrsetNull } from "../../../utils/modal";
import { useOutletContext } from "react-router-dom";
import { Avatar, Button, Checkbox, Dropdown, Empty, message, Modal, Pagination, Table, Tag, Tooltip } from "antd";
import useGradeService, { Grade, GradeTableSearchModel } from "./GradeService";
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
import GradeAdd from "./GradeAdd";



function GradeList() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedData, setSelectedData] = useState<Grade>();
  const [addNew, setAddNew] = useState(false);
  const gradeservice = useGradeService();
  const hasFetchedRef = useRef<string>(""); // Track last filter to prevent duplicate calls

  const loading = useLoading();
  const context: any = useOutletContext();
  const [openDeleteModal, setDeleteOpenModel] = useState(false);
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState("Are you sure you want to delete");

  const authorize = useAuthorization();

  const paginator = usePagination<GradeTableSearchModel>(
    {
      ps: 5,
    });

  // Only fetch when filterData actually changes (not on every render)
  useEffect(() => {
    const filterKey = JSON.stringify(paginator.filterData);
    if (hasFetchedRef.current !== filterKey) {
      hasFetchedRef.current = filterKey;
      searchGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginator.filterData]);

  const deleteGrade = async () => {
    if (selectedData) {
      setSelectedData(undefined);
      gradeservice.deleteGrade(selectedData.id).then((value) => {
        searchGrades();
        setDeleteOpenModel(false);
        message.success("Successfully deleted!")
      });
    }
  };

  const onClose = () => {
    setAddNew(false);
    setSelectedData(undefined);
    searchGrades();
  };
  useEffect(() => {
    context?.setTitle("Grades");
  }, []);



  const searchGrades = () => {
    loading.startLoading();
    gradeservice
      .getGrades(paginator.filterData)
      .then(({ data: result }) => {
        setGrades(result.results);
        loading.stopLoading();
        paginator.setTotal(result.results.length)
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

  const gradeColumn: ColumnsType<Grade> = [
    {
      title: "Grade",
      dataIndex: "grade_name",
      sorter: true,
      key: "grade_name",
      render: (_, data) => (
        <>
          <div className="flex-col gap-x-4 hidden sm:block">
            <div className="font-semibold">{`${data.grade_name}`}</div>
          </div>
          <div className="gap-x-4 sm:hidden flex-col">
            <div className="font-semibold flex gap-1 items-center">
              <a className="text-sm mb-0 font-semibold">Grade:</a>
              <span className="font-thin text-xs">{data.grade_name}</span>
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
  const renderMenuItem = (detail: Grade) => {
    const items = [
      {
        label: "Edit",
        key: "5",
        onClick: () => { setSelectedData(prv=>detail); setAddNew(true) },
        visible: authorize.canUpdate("grade"),
      },
      {
        label: "Delete",
        key: "6",
        onClick: () => { setSelectedData(detail); setDeleteOpenModel(true) },
        visible: authorize.canUpdate("grade"),
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
        <ListHeader title="Grades" addTitle="Add Grade" add={() => setAddNew(!addNew)} load={searchGrades} />

      
          <div>
            <SearchBar
              components={components}
              handleChange={paginator.handleChange}
              filteredData={paginator.filterData}
            />

            <CustomTable
              rowSelection={rowSelection}
              columns={gradeColumn}
              dataSource={grades}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="grade_name"
            />
            <Pagination
              className={`pagination-bar mt-3 ${grades?.length === 0 ? "hidden" : ""
                }`}
              {...paginator}
            />

          </div>

    
      </div >
      {addNew && <Modal
        open={addNew}
        onCancel={onClose}
        footer={[]}
        className="mt-32"
        width={window?.innerWidth < 768 ? "90%" : "40%"}
        height={window?.innerWidth < 768 ? "90%" : "40%"}
      >
        <GradeAdd
          getGrade={() => { searchGrades }}
          cancel={onClose}
          detail={selectedData}
        />
      </Modal>

      }

      <Modal
        title="Confirm Grade Delete?"
        open={openDeleteModal}
        onOk={deleteGrade}
        onCancel={() => setDeleteOpenModel(false)}
        okText="Yes"
        cancelText="No"
        className="mt-32"
      >
        <p>{`Are you sure you want to delete grade: ${selectedData?.grade_name}`}</p>
      </Modal>

    </>
  );
}
export default GradeList;
