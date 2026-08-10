"use client";
import { createContext, useEffect, useState } from "react";
import useUserService from "./UserService";
import useLoading from "../../customs/loading/LoadingHook";
import { PartialUser, User } from "../../../types/UserItem";
import { FaEllipsisV, FaRedo } from "react-icons/fa";
import UserAdd from "./UserAdd";
import { assignOrsetNull } from "../../../utils/modal";
import { useOutletContext } from "react-router-dom";
import { SearchComponentProps } from "../../commons/search-bar/search";
import { componentType } from "../../../types/Enums";
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  message,
  Modal,
  Pagination,
} from "antd";
import useAuthorization, { isVisible } from "../auth/authorization";
import Profile from "../../../component/course/ProfileInstructor";
import { usePagination } from "../../customs/pagination/usePagination";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import SearchBar from "../../commons/search-bar/SearchBar";
import { IsWindowUndefined } from "@/utils/func_utils";
import Table, { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import { TableRowSelection } from "antd/es/table/interface";
import CustomTable from "@/components/commons/Table/Table";
import useGroupService from "../group/GroupService";
import { SelectItem } from "@/types/MenuItems";
import { Group } from "@/types/GroupPermission";

export interface UserContextType {
  userId: string;
}
export const UserContext = createContext<UserContextType>(
  {} as UserContextType
);

function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedData, setSelectedData] = useState<User>();
  const userService = useUserService();
  const loading = useLoading();
  const context: any = useOutletContext();
  const authorization = useAuthorization();

  const paginator = usePagination({ ps: 5 });
  const [open, setOpen] = useState(false);
  const [createUser, setCreateUser] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const userDetail = useSelector((state: AppState) => state.user);
  const [createNewUser, setCreateNewCourse] = useState(false);
  const [group, serGroup] = useState<Group>();
  const [groupsData, setGroupsData] = useState<SelectItem<string>[]>([]);

  const getGroupsData = (newValue: string = "") => {
    groupService
      .getGroups({
        ps: 15,
        cursor: "",
        search: newValue,
      })
      .then(({ data: response }) => {
        let data = response.results;
        setGroupsData(
          data.map((resp) => ({
            label: resp.name,
            value: resp.id,
          }))
        );
      });
  };

  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
    {
      placeholder: "Group",
      key: "group",
      type: componentType.SEARCH,
      options: groupsData || [],
      search: getGroupsData,
    
    },
  ];
  const groupService = useGroupService();
  useEffect(() => {
    authorization.requireRead("customuser");
    context?.setTitle("Users");
    searchUsers();
    getGroupsData();
  }, [paginator.filterData]);

  const onClose = () => {
    setCreateUser(false);
    setSelectedData(undefined);
  };

  const searchUsers = () => {
    loading.startLoading();
    userService
      .getUsers(paginator.filterData)
      .then(({ data: result }) => {
        setUsers(result.results);
        paginator.setTotal(result.count);
        loading.stopLoading();
      })
      .catch((error) => loading.stopLoading());
  };

  const handleUserActivation = (user: User) => {
    loading.startLoading();
    userService
      .updateUser(user.id, { is_active: !user.is_active } as PartialUser)
      .then((result) => {
        searchUsers();
        loading.stopLoading();
      });
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    loading.startLoading();
    userService
      .deleteUser(userToDelete.id)
      .then(() => {
        message.success("User deleted successfully");
        setOpenDeleteModal(false);
        setUserToDelete(null);
        searchUsers();
        loading.stopLoading();
      })
      .catch((error) => {
        loading.stopLoading();
        message.error(error?.response?.data?.detail || "Failed to delete user");
      });
  };

  const courseColumns: ColumnsType<User> = [
    {
      title: "Profile",
      dataIndex: "name",
      sorter: true,
      key: "id",
      render: (_, { username, profile_picture, id }) => (
        <>
          <div>
            <Avatar
              src={profile_picture}
              alt="Image not found"
              size={60}
            />
          </div>
          <div className="flex-col hidden gap-x-4 sm:flex">
            <div className="font-semibold">{username}</div>
          </div>
          <div className="flex-col gap-x-4 sm:hidden">
            <Link href={`/dashboard/courses/${id}`}>{username}</Link>
          </div>
        </>
      ),
    },

    {
      title: "Full Name",
      dataIndex: "full_name",
      key: "full_name",
      sorter: true,
      render: (_, { first_name, last_name, middle_name, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {first_name} {last_name} {middle_name}
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      render: (_, { email }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{email}</div>
          </div>
        </>
      ),
    },

    {
      title: "Phone Number",
      dataIndex: "phone_number",
      key: "phone_number",
      sorter: true,
      render: (_, { phone_number }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{phone_number}</div>
          </div>
        </>
      ),
    },

    {
      title: "Gender",
      dataIndex: "gender",
      key: "phone_number",
      sorter: true,
      render: (_, { gender }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{gender}</div>
          </div>
        </>
      ),
    },

    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      sorter: true,
      render: (_, { bio }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">{bio}</div>
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
  const renderMenuItem = (detail: User) => {
    const isCurrentUser = userDetail?.id === detail.id;
    const items = [
      {
        label: detail.is_active ? "Deactivate" : "Activate",
        key: "activate",
        onClick: () => handleUserActivation(detail),
        visible: authorization.canUpdate("customuser") && !isCurrentUser,
      },
      {
        label: "View Detail",
        key: "view",
        onClick: () => {
          setUserId(detail.id);
          setOpen(true);
        },
        visible: authorization.canUpdate("customuser"),
      },
      {
        label: "Edit",
        key: "edit",
        onClick: () => {
          assignOrsetNull(setSelectedData, selectedData, detail);
          setCreateUser(true);
        },
        visible: authorization.canUpdate("customuser"),
      },
      {
        label: "Delete",
        key: "delete",
        danger: true,
        onClick: () => {
          setUserToDelete(detail);
          setOpenDeleteModal(true);
        },
        visible: authorization.canDelete("customuser") && !isCurrentUser,
      },
    ];

    return items.filter((item) => item.visible != false);
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<User> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const cancel = () => {
    setSelectedData(undefined);
    setCreateUser(false);
  };
  const handleGroupChange = (e: Event) => {};

  return (
    <>
      {/*<SmallLoading {...loading}/>*/}
      <div className="flex flex-col-reverse p-1 sm:flex-row">
        <div className="flex-wrap w-full">
          <div className="flex flex-wrap items-center gap-2 pt-5">
            <h1 className="p-1 text-2xl font-bold text-custom_orange-800">
              Users
            </h1>

            <button
              className="px-5 py-1 text-lg text-white transition duration-300 ease-out border border-gray-300 rounded-lg bg-custom_orange-700 hover:bg-black hover:ease-out  "
              onClick={() => setCreateUser(true)}
            >
              New User
            </button>

            <SearchBar
              components={components}
              handleChange={paginator.handleChange}
              filteredData={{...paginator.filterData}}
            />
            {/* <div className="w-60">
                <FloatSelect
                  className="margin-0 max-width-none"
                  placeholder="Select Type"
                  allowClear
                  showSearch
                  value={group?.name}
                  onSearch={getGroupsData}
                  onFocus={() => getGroupsData("")}
                  options={groupsData}
                  onChange={(e) => {
                    handleGroupChange(e);
                  }}
                />
              </div> */}
          </div>
          <div className="flex flex-row gap-4 py-3 text-gray-500">
            <Checkbox />
            <i>
              <FaRedo />
            </i>
            <i>
              <FaEllipsisV />
            </i>
            <div className=""></div>
          </div>
          <div className="relative w-full flex flex-col flex-wrap gap-4 mb-10 md:mr-10 max-sm:text-sm">
            {/* {users.map((user) => (
              <div key={user.id}>
                {" "}
                <CustomCard
                  className={`${
                    selectedData?.id === user.id && " border-custom_orange-900 "
                  }`}
                >
                  <div className="flex flex-row justify-between max-lg:flex-wrap">
                    <div className="flex flex-col flex-wrap max-sm:p-5">
                      <div className="flex flex-row justify-start xl:space-x-5">
                        <div className="flex flex-col items-center space-y-2">
                          <h1>{user.username}</h1>
                        </div>
                        <div className="flex flex-col flex-wrap">
                          <div className="flex flex-row flex-wrap xl:space-x-5">
                            <div>
                              <h1>
                                {" "}
                                {user.first_name} {user.middle_name}{" "}
                                {user.last_name}
                              </h1>
                            </div>
                            <div>
                              <p>{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-row flex-wrap xl:space-x-5">
                           
                            <div>{user.phone_number}</div>
                            <div>
                              <h1>
                                {" "}
                                {
                                  GenderOption.find(
                                    (val) => val.value === user?.gender
                                  )?.label
                                }
                              </h1>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="self-center w-full pt-4 mt-5" />
                      <div className="flex flex-row flex-wrap mx-5 space-x-3 lg:mx-16">
                        {user.bio}
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col flex-wrap items-center justify-center space-y-2 max-sm:flex-row">
                        <CustomButton
                          className="custom-button"
                          text="View Detail"
                          type="button"
                          fun={() => {
                            setUserId(user.id);
                            setOpen(true);
                          }}
                          is_loading={<SmallLoading {...loading} />}
                        />
                        <CustomButton
                          className="custom-button"
                          text="Edit"
                          type="button"
                          fun={() => {
                            assignOrsetNull(
                              setSelectedData,
                              selectedData,
                              user
                            );
                            setCreateUser(true);
                          }}
                          is_loading={<SmallLoading {...loading} />}
                        />
                        <CustomButton
                          className={`custom-button ${
                            user.id === userDetail.id && "hidden"
                          }`}
                          text={user.is_active ? "Deactivate" : "Activate"}
                          fun={() => handleUserActivation(user)}
                          is_loading={<SmallLoading {...loading} />}
                        />
                      </div>
                    </div>
                  </div>
                </CustomCard>{" "}
              </div>
            ))} */}

            <CustomTable
              rowSelection={rowSelection}
              columns={courseColumns}
              dataSource={users}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="id"
            />
            <Modal
              mask={false}
              title="Instructor Request"
              className="mt-20"
              centered
              destroyOnClose
              open={open}
              okText={"Close"}
              onOk={() => setOpen(false)}
              onCancel={() => {
                setOpen(false);
                setUserId("");
              }}
              width={1200}
            >
              <Profile userId={userId} userListDetail={true} />
            </Modal>
            <Pagination {...paginator} />
          </div>
        </div>

        <Modal
          open={createUser}
          className={`${isVisible(
            authorization.canCreate("customuser")
          )} hidden md:block `}
          onCancel={cancel}
          footer={[]}
          width={
            IsWindowUndefined() && window?.innerWidth < 768 ? "100%" : "80%"
          }
          height={
            IsWindowUndefined() && window?.innerWidth < 768 ? "100%" : "80%"
          }
        >
          {selectedData ? (
            <UserAdd
              userDetail={selectedData}
              onClose={onClose}
              searchUsers={searchUsers}
            />
          ) : (
            <UserAdd searchUsers={searchUsers} onClose={onClose} />
          )}
        </Modal>
      </div>

      <Modal
        onCancel={onClose}
        destroyOnClose
        open={createUser && IsWindowUndefined() && window?.innerWidth < 768}
        footer={[]}
      >
        <UserAdd
          userDetail={selectedData}
          searchUsers={searchUsers}
          onClose={onClose}
        />
      </Modal>

      <Modal
        title="Delete User"
        open={openDeleteModal}
        onOk={handleDeleteUser}
        onCancel={() => {
          setOpenDeleteModal(false);
          setUserToDelete(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete user{" "}
          <strong>
            {userToDelete?.username} ({userToDelete?.first_name}{" "}
            {userToDelete?.last_name})
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
export default UsersList;
