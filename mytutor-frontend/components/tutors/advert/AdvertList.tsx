"use client";
import { useEffect, useState } from "react";
import Loading from "../../customs/loading/Loading";
import useLoading from "../../customs/loading/LoadingHook";
import { Advert, PartialAdvert } from "../../../types/AdvertItem";
import { FaEllipsisV, FaRedo } from "react-icons/fa";
import AdvertAdd from "./AdvertAdd";
import { useOutletContext } from "react-router-dom";
import { SearchComponentProps } from "../../commons/search-bar/search";
import { AdvertStatus, componentType } from "../../../types/Enums";
import AdvertCard from "./AdvertCard";
import { Button, Checkbox, Dropdown, Modal, Pagination, Popconfirm,message } from "antd";
import useAdvertService from "./AdvertService";
import { IsWindowUndefined } from "@/utils/func_utils";
import { usePagination } from "../../customs/pagination/usePagination";
import useAuthorization from "@/components/account/auth/authorization";
import Table, { ColumnsType } from "antd/es/table";
import { Image } from "antd";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import { TableRowSelection } from "antd/es/table/interface";
import CustomTable from "@/components/commons/Table/Table";
import { start } from "repl";
import { convertDateString } from "@/utils/timeUtils";
function AdvertsList() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedData, setSelectedData] = useState<Advert>();
  const [addNew, setAddNew] = useState(false);
  const advertservice = useAdvertService();
  const loading = useLoading();
  const context: any = useOutletContext();
  const paginator = usePagination({ ps: 5 });
  const authorization = useAuthorization();
  
  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
  ];

  const cancel = () => {
    setAddNew(false);
    setSelectedData(undefined);
  };

  const editAdvert = (data: Advert) => {
    setSelectedData(data);
    setAddNew(true)
  };

  const deleteBank = async (advert:Advert) => {
  
    advertservice.deleteAdvert(advert).then(value => {
      searchAdverts()
    }).catch(err=>{

    });
  };

  const advertColumns: ColumnsType<Advert> = [
    {
      title: "username",
      dataIndex: "name",
      sorter: true,
      key: "id",
      render: (_, { image_url }) => (
        <>
          <div className="flex-col  gap-x-4 sm:flex">
          <Image preview={false} className="max-w-10 max-h-10 rounded sm:max-w-14 sm:max-h-14" src={image_url as string} alt="Image not found" />
           
          </div>
         
        </>
      ),
    },

    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      sorter: true,
      render: (_, { company_name }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {company_name}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      key: "start_time",
      sorter: true,
      render: (_, { start_time }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{convertDateString(start_time.toLocaleString())}</div>
          </div>
        </>
      ),
    },
     {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      sorter: true,
      render: (_, {end_time }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{convertDateString(end_time.toLocaleString())}</div>
          </div>
        </>
      ),
    },

    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      sorter: true,
      render: (_, { position }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{

           ( position==100)?"Top":(position==101)?"Middle":"Bottom"
            }</div>
          </div>
        </>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (_, { status }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{status===AdvertStatus.ACTIVE?"Active":"Inactive"}</div>
          </div>
        </>
      ),
    },

    {
      title: "link",
      dataIndex: "link",
      key: "link",
      sorter: true,
      render: (_, { link }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{link}</div>
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
  const renderMenuItem = (detail: Advert) => {
    const items = [
     
      {
        label: "Edit",
        key: "1",
        onClick: ()=>editAdvert(detail),
        visible: authorization.canUpdate("adverts"),
      },

      {
        label: (
          <Popconfirm
            title="Delete the Advert"
            description="Are you sure to delete this Advert?"
            onConfirm={() => deleteBank(detail)}
            okText="Yes"
            cancelText="No"
          >
            delete
          </Popconfirm>
        ),
        key: "2",
        visible: authorization.canDelete("adverts"),
      },
      {
        label: (
          <Popconfirm
            title= {`${detail.status==AdvertStatus.ACTIVE?"Inactive":"active"} the Advert`}
            description={`Are you sure to ${detail.status==AdvertStatus.ACTIVE?"Inactive":"active"} this Advert?`}
            onConfirm={() => handleAdvertApprove(detail.id,detail.status==AdvertStatus.ACTIVE?AdvertStatus.INACTIVE:AdvertStatus.ACTIVE)}
            okText="Yes"
            cancelText="No"
          >
           
            {`${detail.status==AdvertStatus.ACTIVE?"Inactive":"Active"} `}
          </Popconfirm>
        ),
        key: "2",
        visible: authorization.canDelete("adverts"),
      },
    ];

    return items.filter((item) => item.visible != false);
    // return items;
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<Advert> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  useEffect(() => {
    context?.setTitle("Adverts");
  }, []);

  useEffect(() => {
    searchAdverts();
  }, [paginator.filterData]);

  const searchAdverts = () => {
    loading.startLoading();
    advertservice
      .getAdverts(paginator.filterData,{ position: null, isHome: false })
      .then(({ data: result }) => {
        setAdverts(result.results);
        paginator.setTotal(result.count);
        loading.stopLoading();
      })
      .catch((error) => loading.stopLoading());
  };

  const handleAdvertApprove = (id: string, status: number) => {
    loading.startLoading();
    let data: PartialAdvert;
    data = { status: status };

    advertservice
      .partialUpdateTutorContract(id, data)
      .then(() => {
      searchAdverts()
        loading.stopLoading();
        message.success("Successfully approved!");
      })
      .catch(() => {
        loading.stopLoading();
      });
  };
  return (
    <>
      {/*<SmallLoading {...loading}/>*/}
      <div className="flex md:mx-10 p-2">
        <div className="w-full flex-wrap pt-2 md:p-4">
          <div className="flex justify-between gap-2 ">
            <h1 className="text-custom_orange-800 text-2xl font-bold">
              Adverts
            </h1>

            <button
              className="text-white text-md rounded-[30px] border border-gray-300  bg-custom_orange-700  hover:bg-black  transition duration-300 ease-out hover:ease-out  px-[10px] py-0"
              onClick={() => setAddNew(!addNew)}
            >
              Add New
            </button>
          </div>
          <div className="flex flex-row gap-4 py-3 text-gray-500">
            <Checkbox />
            <i>
              <FaRedo />
            </i>
            <i>
              <FaEllipsisV />
            </i>
          </div>
          <div className="md:mr-10 mb-10 relative flex flex-col gap-4">
            <Loading {...loading} />
            {/* {adverts.map((advert) => (
              <AdvertCard
                key={advert.id}
                value={advert}
                searchDatas={searchAdverts}
                editAdvert={editAdvert}
              />
            ))} */}
            <CustomTable
              rowSelection={rowSelection}
              columns={advertColumns}
              dataSource={adverts}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="id"
            />
          </div>
          <Pagination {...paginator} className="full"  />
        </div>
        {/* <div className="w-2/5 hidden md:block p-4">
          <div className="col-span-3">
            <AdvertAdd
              advertDetail={selectedData}
              cancel={cancel}
              searchAdverts={searchAdverts}
            />
          </div>
        </div> */}
      </div>
      <Modal
        open={addNew }
        onCancel={cancel}
        footer={[]}
      >
        <AdvertAdd
          advertDetail={selectedData}
          cancel={cancel}
          searchAdverts={searchAdverts}
        />
      </Modal>
    </>
  );
}
export default AdvertsList;
