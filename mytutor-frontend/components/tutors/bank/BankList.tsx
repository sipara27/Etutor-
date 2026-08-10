"use client"
import { useEffect, useState } from 'react';
import Loading from '../../customs/loading/Loading';
import useLoading from '../../customs/loading/LoadingHook';
import { Bank } from '../../../types/BankItem';
import { FaEllipsisV, FaRedo, FaRegSquare, FaTrashAlt } from 'react-icons/fa';
import CustomCard from '../../customs/custom-card/CustomCard';
import BankAdd from './BankAdd';
import { assignOrsetNull } from '../../../utils/modal';
import { useOutletContext } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Pagination, Popconfirm } from 'antd';
import useBankService from './BankService';
import useToast from '../../customs/toast/ToastHook';
import { Modal } from '../../commons/modal/Modal';
import useBankApi from './BankApi';
import Table, { ColumnsType } from 'antd/es/table';
import { CaretDownOutlined, MoreOutlined } from '@ant-design/icons';
import { usePagination } from '@/components/customs/pagination/usePagination';
import useAuthorization from '@/components/account/auth/authorization';
import { TableRowSelection } from 'antd/es/table/interface';
import CustomTable from '@/components/commons/Table/Table';


function BanksList() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedData, setSelectedData] = useState<Bank>();
  const [addNew, setAddNew] = useState(false);
  const bankservice = useBankService();

  const loading = useLoading();
  const context: any = useOutletContext();
  const [openModel, setOpenModel] = useState("");

  const bankApi = useBankApi();
  const paginator = usePagination({ ps: 5 });
  const authorization = useAuthorization();

  const deleteBank = async (id:string) => {
    // let id = openModel === '' ? openModel : '';
    setSelectedData(undefined)
    bankApi.deleteBank_({
      id,
      setOpenModel,
      setBanksList: setBanks,
    }).then(value => {
      searchBanks()
    });
  };

  const cancel = () => {
    setAddNew(false);
    setSelectedData(undefined);
  };

  useEffect(() => {
    context?.setTitle("Banks");
  }, []);


  const bankColumns: ColumnsType<Bank> = [
    {
      title: "Name",
      dataIndex: "bank_name",
      sorter: true,
      key: "id",
      render: (_, { bank_name }) => (
        <>
          <div className="flex-col  gap-x-4 sm:flex">
          {bank_name}
          </div>
         
        </>
      ),
    },

    {
      title: "Account Number",
      dataIndex: "account_number",
      key: "account_number",
      sorter: true,
      render: (_, { account_number }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {account_number}
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
      render: (_, { description }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
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
  const renderMenuItem = (detail: Bank) => {
    const items = [
     
      {
        label: (
          <Popconfirm
            title="Delete the Bank"
            description="Are you sure to delete this Bank?"
            onConfirm={() => deleteBank(detail.id)}
            okText="Yes"
            cancelText="No"
          >
            delete
          </Popconfirm>
        ),
        key: "2",
        visible: authorization.canDelete("banks"),
      },
      {
        label: "Edit",
        key: "1",
        onClick: () => setSelectedData(detail),
        visible: authorization.canUpdate("banks"),
      },
      
    ];

    return items.filter((item) => item.visible != false);
    // return items;
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<Bank> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  useEffect(() => {
    searchBanks()
  }, [paginator.filterData]);

  const searchBanks = () => {
    loading.startLoading();
    bankservice
      .getBanks(paginator.filterData)
      .then(({ data: result }) => {
        setBanks(result.results);
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
              Banks
            </h1>

            <button
              className="text-white text-md rounded-[30px] border border-gray-300  bg-custom_orange-700  hover:bg-black  transition duration-300 ease-out hover:ease-out md:hidden  px-[10px] py-0"
              onClick={() => setAddNew(!addNew)}
            >
              Add New
            </button>
          </div>
          <div className="flex flex-row gap-4 py-3 text-gray-500">
            <Checkbox />
            <i onClick={() => searchBanks()} className="cursor-pointer">
              <FaRedo />
            </i>
            <i>
              <FaEllipsisV />
            </i>
            {selectedData && (
              <FaTrashAlt
                className="p-0"
                onClick={() => setOpenModel(selectedData.id)}
              />
            )}
          </div>
          <div
            className={`fixed top-0 left-0 right-0 z-50
         bg-slate-300 bg-opacity-80 flex items-center justify-center
           w-full p-4 
           overflow-x-hidden 
           overflow-y-auto md:inset-0 h-modal md:h-full  transition ease-in-out duration-1000 ${
             openModel === "" ? "hidden" : "block"
           }`}
          >
            <Modal setOpenModel={setOpenModel} deleteMethod={deleteBank} />
          </div>
          <div className="md:mr-10 mb-10 flex relative flex-col gap-4">
            <Loading {...loading} />
            {/* {banks.map((bank) => (
              <div onClick={() => { assignOrsetNull(setSelectedData, selectedData, bank); setAddNew(!addNew) }} key={bank.id}>
                {' '}
                <CustomCard className={`${selectedData?.id === bank.id && ' border-custom_orange-900 '}`}>
                  <h1 className="text-gray-500 mb-2 font-medium">
                    {bank.bank_name}
                  </h1>
                  <div className="flex flex-col pl-3 justify-between border-custom_orange-900 border-solid border-l-[4px]">
                    <p className="font-semibold">{bank.account_number}</p>
                    <p className="text-sm text-gray-500 ">{bank.description}</p>
                  </div>
                </CustomCard>{" "}
              </div>
            ))} */}
             <CustomTable
              rowSelection={rowSelection}
              columns={bankColumns}
              dataSource={banks}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="id"
            />
          </div>
          <Pagination {...paginator} />
        </div>
        <div className="w-2/5 hidden md:block p-4">
          <div className="col-span-3">
            <BankAdd
              bankDetail={selectedData}
              cancel={cancel}
              searchBanks={searchBanks}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default BanksList;
