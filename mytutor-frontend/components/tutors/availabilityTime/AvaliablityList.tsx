"use client"
import { useEffect, useState } from 'react';
import Loading from '../../customs/loading/Loading';
import useLoading from '../../customs/loading/LoadingHook';
import { AvailablityTime } from '../../../types/AvailablityItem';
import { FaEllipsisV, FaRedo, FaRegSquare, FaTrashAlt } from 'react-icons/fa';
import CustomCard from '../../customs/custom-card/CustomCard';
import AvailablityTimeAdd from './AvailabilityTimeAdd';
import { assignOrsetNull } from '../../../utils/modal';
import { useOutletContext } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Modal, Pagination, Popconfirm } from 'antd';
import useAvailablityTimeService from './AvaliablityService';
import useToast from '../../customs/toast/ToastHook';

import Table, { ColumnsType } from 'antd/es/table';
import { CaretDownOutlined, MoreOutlined } from '@ant-design/icons';
import { usePagination } from '@/components/customs/pagination/usePagination';
import useAuthorization from '@/components/account/auth/authorization';
import { TableRowSelection } from 'antd/es/table/interface';
import CustomTable from '@/components/commons/Table/Table';
import { AdvertStatus, Days } from "../../../types/Enums";

function AvailablityTimesList() {
  const [AvailablityTimes, setAvailablityTimes] = useState<AvailablityTime[]>([]);
  const [selectedData, setSelectedData] = useState<AvailablityTime>();
  const [addNew, setAddNew] = useState(false);
  const AvailablityTimeservice = useAvailablityTimeService();

  const loading = useLoading();
  const context: any = useOutletContext();
  const [openModel, setOpenModel] = useState("");


  const paginator = usePagination({ ps: 5 });
  const authorization = useAuthorization();

 

  const cancel = () => {
    setAddNew(false);
    setSelectedData(undefined);
  };

  const activeInactive=(availablityTime:AvailablityTime,status:number)=>{
      availablityTime.status = status;
      AvailablityTimeservice.editAvailablityTime(availablityTime).then(res=>{
          searchAvailablityTimes()
      }).catch(err=>{

      })
  }
  useEffect(() => {
    context?.setTitle("AvailablityTimes");
  }, []);


  const AvailablityTimeColumns: ColumnsType<AvailablityTime> = [
    {
      title: "day",
      dataIndex: "day",
      sorter: true,
      key: "id",
      render: (_, { day }) => (
        <>
          <div className="flex-col  gap-x-4 sm:flex">
          {Days[day-1]?.label}
          </div>
         
        </>
      ),
    },

    {
      title: "start time",
      dataIndex: "start_time",
      sorter: true,
      key: "id",
      render: (_, { start_time }) => (
        <>
          <div className="flex-col  gap-x-4 sm:flex">
          {start_time.toLocaleString()}
          </div>
         
        </>
      ),
    },

    {
      title: "end time",
      dataIndex: "end_time",
      key: "end_time",
      sorter: true,
      render: (_, { end_time }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {end_time.toLocaleString()}
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
              {status==AdvertStatus.ACTIVE?"Active":"Inactive"}
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
  const renderMenuItem = (detail: AvailablityTime) => {
    const items = [
     
     
      {
        label: detail.status==AdvertStatus.ACTIVE?"Inactive":"Active",
        key: "1",
        onClick: () => activeInactive(detail,detail.status==AdvertStatus.ACTIVE?AdvertStatus.INACTIVE:AdvertStatus.ACTIVE),
        visible: authorization.canUpdate("AvailablityTimes"),
      },
      
    ];

    return items.filter((item) => item.visible != false);
    // return items;
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<AvailablityTime> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  useEffect(() => {
    searchAvailablityTimes()
  }, [paginator.filterData]);

  const searchAvailablityTimes = () => {
    loading.startLoading();
    AvailablityTimeservice
      .getAvailablityTimes(paginator.filterData)
      .then(({ data: result }) => {
        setAvailablityTimes(result.results);
        paginator.setTotal(result.count);
        loading.stopLoading();
      })
      .catch((error) => loading.stopLoading());
  };
  return (
    <>
      <div className="flex md:mx-10 p-2">
        <div className="w-full flex-wrap pt-2 md:p-4">
          <div className="flex gap-2 justify-between">
            <h1 className="text-custom_orange-800 text-2xl font-bold text-left">
              AvailablityTimes
            </h1>

            <button
              className="text-white text-md rounded-[30px] border border-gray-300  bg-custom_orange-700  hover:bg-black  transition duration-300 ease-out hover:ease-out   px-[10px] py-0"
              onClick={() => setAddNew(!addNew)}
            >
              Add New
            </button>
          </div>
          <div className="flex flex-row gap-4 py-3 text-gray-500">
            <Checkbox />
            <i onClick={() => searchAvailablityTimes()} className="cursor-pointer">
              <FaRedo />
            </i>
            <i>
              <FaEllipsisV />
            </i>
          
          </div>
         
          <div className="md:mr-10 mb-10 flex relative flex-col gap-4">
            <Loading {...loading} />
            {/* {AvailablityTimes.map((AvailablityTime) => (
              <div onClick={() => { assignOrsetNull(setSelectedData, selectedData, AvailablityTime); setAddNew(!addNew) }} key={AvailablityTime.id}>
                {' '}
                <CustomCard className={`${selectedData?.id === AvailablityTime.id && ' border-custom_orange-900 '}`}>
                  <h1 className="text-gray-500 mb-2 font-medium">
                    {AvailablityTime.AvailablityTime_name}
                  </h1>
                  <div className="flex flex-col pl-3 justify-between border-custom_orange-900 border-solid border-l-[4px]">
                    <p className="font-semibold">{AvailablityTime.account_number}</p>
                    <p className="text-sm text-gray-500 ">{AvailablityTime.description}</p>
                  </div>
                </CustomCard>{" "}
              </div>
            ))} */}
             <CustomTable
              rowSelection={rowSelection}
              columns={AvailablityTimeColumns}
              dataSource={AvailablityTimes}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="id"
            />
          </div>
          <Pagination {...paginator} />
        </div>
        <Modal
        open={addNew }
        onCancel={cancel}
        footer={[]}
      >
            <AvailablityTimeAdd
              AvailablityTimeDetail={selectedData}
              cancel={cancel}
              searchAvailablityTimes={searchAvailablityTimes}
            />
          </Modal>
      </div>
    </>
  );
}
export default AvailablityTimesList;
