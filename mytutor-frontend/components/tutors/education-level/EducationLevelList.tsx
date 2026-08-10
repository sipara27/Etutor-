import { useEffect, useState, useRef } from "react";
import Loading from "../../customs/loading/Loading";
import useLoading from "../../customs/loading/LoadingHook";
import { FaEllipsisV, FaPlus, FaRedo, FaTrashAlt } from "react-icons/fa";
import CustomCard from "../../customs/custom-card/CustomCard";
import { assignOrsetNull } from "../../../utils/modal";
import { useOutletContext } from "react-router-dom";
import { Avatar, Button, Checkbox, Dropdown, Empty, message, Modal, Pagination, Table, Tag, Tooltip } from "antd";
import useEducationLevelService, { EducationLevel, EducationLevelTableSearchModel } from "./EducationLevelService";
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
import EducationLevelAdd from "./EducationLevelAdd";

interface Props {
  data: EducationLevel[];
}

function EducationLevelList(props: Props) {
  const [educationlevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [selectedData, setSelectedData] = useState<EducationLevel>();
  const [addNew, setAddNew] = useState(false);
  const educationlevelservice = useEducationLevelService();
  const hasFetchedRef = useRef(false); // Prevent duplicate calls

  const loading = useLoading();
  const context: any = useOutletContext();
  const [openDeleteModal, setDeleteOpenModel] = useState(false);
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState("Are you sure you want to delete");

  const authorize = useAuthorization();

  const paginator = usePagination<EducationLevelTableSearchModel>(
    {
      ps: 5,
    });

  const deleteEducationLevel = async () => {
    if (selectedData) {
      setSelectedData(undefined);
      educationlevelservice.deleteEducationLevel(selectedData.id).then((value) => {
        searchEducationLevels();
        setDeleteOpenModel(false);
        message.success("Successfully deleted!")
      });
    }
  };

  const onClose = () => {
    setAddNew(false);
    setSelectedData(undefined);
    searchEducationLevels();
  };
  useEffect(() => {
    context?.setTitle("EducationLevels");
  }, []);

  // Use data prop if provided, otherwise fetch (only once)
  useEffect(() => {
    if (props.data && props.data.length > 0) {
      setEducationLevels(props.data);
      paginator.setTotal(props.data.length);
    } else if (!hasFetchedRef.current) {
      // Only fetch once to prevent duplicate calls
      hasFetchedRef.current = true;
      searchEducationLevels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchEducationLevels = () => {
    loading.startLoading();
    educationlevelservice
      .getEducationLevels()
      .then(({ data: result }) => {
        setEducationLevels(result.results);
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

  const educationlevelColumn: ColumnsType<EducationLevel> = [
    {
      title: "EducationLevel",
      dataIndex: "educationlevel_name",
      sorter: true,
      key: "educationlevel_name",
      render: (_, data) => (
        <>
          <div className="flex-col gap-x-4 hidden sm:block">
            <div className="font-semibold">{`${data.educationlevel_name}`}</div>
          </div>
          <div className="gap-x-4 sm:hidden flex-col">
            <div className="font-semibold flex gap-1 items-center">
              <a className="text-sm mb-0 font-semibold">EducationLevel:</a>
              <span className="font-thin text-xs">{data.educationlevel_name}</span>
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
  const renderMenuItem = (detail: EducationLevel) => {
    const items = [
      {
        label: "Edit",
        key: "5",
        onClick: () => { setSelectedData(prv=>detail); setAddNew(true) },
        visible: authorize.canUpdate("educationlevel"),
      },
      {
        label: "Delete",
        key: "6",
        onClick: () => { setSelectedData(detail); setDeleteOpenModel(true) },
        visible: authorize.canUpdate("educationlevel"),
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
        <ListHeader title="EducationLevels" addTitle="Add EducationLevel" add={() => setAddNew(!addNew)} load={searchEducationLevels} />

        {educationlevels?.length === 0 ? (
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
              columns={educationlevelColumn}
              dataSource={educationlevels}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="educationlevel_name"
            />
            <Pagination
              className={`pagination-bar mt-3 ${educationlevels?.length === 0 ? "hidden" : ""
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
        <EducationLevelAdd
          getEducationLevel={() => { searchEducationLevels }}
          cancel={onClose}
          detail={selectedData}
        />
      </Modal>

      }

      <Modal
        title="Confirm EducationLevel Delete?"
        open={openDeleteModal}
        onOk={deleteEducationLevel}
        onCancel={() => setDeleteOpenModel(false)}
        okText="Yes"
        cancelText="No"
        className="mt-32"
      >
        <p>{`Are you sure you want to delete educationlevel: ${selectedData?.educationlevel_name}`}</p>
      </Modal>

    </>
  );
}
export default EducationLevelList;
