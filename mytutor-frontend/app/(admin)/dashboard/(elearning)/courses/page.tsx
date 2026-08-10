"use client"
import { useOutletContext } from "react-router-dom"
import { useEffect, useState } from "react"
import { Course, CourseMissingType, CourseTableSearchModel } from "@/types/Course"
import useCourseService from "@/components/courses/course/CourseService"
import Loading from "@/components/customs/loading/Loading"
import useLoading from "@/components/customs/loading/LoadingHook"
import { Modal } from '@/components/commons/modal/Modal';
import { Modal as Dialog, Dropdown, Empty, Popconfirm, Tooltip } from 'antd';
import { FaEdit, FaEllipsisV, FaPlus, FaPlusSquare, FaRedo, FaTimesCircle, FaTrashAlt } from "react-icons/fa"
import { Button } from "@/components/customs/custom-components/components"
import { Course_Status, componentType, courseLevel, courseStatus, courseType } from "@/types/Enums"
import { SearchComponentProps } from "@/components/commons/search-bar/search"
import { usePagination } from "@/components/customs/pagination/usePagination"
import CourseAdd from "@/components/courses/course/CourseAdd"
import { Checkbox, Pagination } from "antd"
import SearchBar from "@/components/commons/search-bar/SearchBar"
import CustomCard from "@/components/customs/custom-card/CustomCard"
import { assignOrsetNull } from "@/utils/modal"
import { Rating } from "@/components/customs/custom-components/Star"
import { getLabelByValue } from "@/utils/array"
import CourseMissing from "@/components/courses/course/CourseMissing"
import { Image } from "antd"
import Link from "next/link"
import { generateUniqueKey, IsWindowUndefined } from "@/utils/func_utils"
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons"
import Table, { ColumnsType } from "antd/es/table"
import CustomTable from "@/components/commons/Table/Table"
import { TableRowSelection } from "antd/es/table/interface"
import useAuthorization from "@/components/account/auth/authorization"
import ListHeader from "@/components/commons/ListHeader"



function CoursesList(props: any) {
  const [courses, setCourses] = useState<Course[]>([])
  const paginator = usePagination<CourseTableSearchModel>({ method: "my_courses" })
  const [courseMissing, setCourseMissing] = useState<CourseMissingType>();
  const [open, setOpen] = useState(false);
  const context: any = useOutletContext();
  const courseService = useCourseService();
  const [selectedData, setSelectedData] = useState<Course>();
  const loading = useLoading()
  const [createNewCourse, setCreateNewCourse] = useState(false);
  const authorize = useAuthorization();

  const components: SearchComponentProps[] = [
    {
      placeholder: "Search",
      key: "search",
      type: componentType.TEXT,
    },
    {
      placeholder: "Course Status",
      key: "course_status",
      type: componentType.DROPDOWN,
      options: courseStatus,
    }
    // {
    // 	placeholder: "Start date",
    // 	key: "sd",
    // 	type: componentType.DATE,
    // },
    // {
    // 	placeholder: "End date",
    // 	key: "ed",
    // 	type: componentType.DATE,
    // },
  ]


  useEffect(() => {
    context?.setTitle("Courses")
  }, [])

  useEffect(() => {
    searchCourses()
  }, [paginator.filterData])

  const searchCourses = () => {
    loading.startLoading()
    courseService.getCourses(paginator.filterData).then(
      ({ data: result }) => {
        setCourses(result.results)
        paginator.setTotal(result.count)
        loading.stopLoading()
      }
    ).catch(error => loading.stopLoading())

  }
  const cancel = () => {
    setSelectedData(undefined);
    setCreateNewCourse(false)
  }

  const [openModel, setOpenModel] = useState("")
  const deleteCourse = async (data:Course) => {
    // let id = openModel === "" ? openModel : ""
    courseService.deleteCourse(data).then(result => {
      courseService.getCourses(paginator.filterData).then(
        ({ data: result }) => {

          setCourses(result.results)
          loading.stopLoading()
        }
      )
      setOpenModel("")
    })
  }

  const courseRequestPublish = (id: string) => {
    courseService.courseDo(id, "ready_to_publish").then(({ data: value }) => {
      if (value.invalid) {
        setOpen(true)
        setCourseMissing(value as any)
      } else {
        searchCourses()
      }
    })
  }

  const coursesColumns: ColumnsType<Course> = [

    {
      title: "Image",
      dataIndex: "course_image",
      sorter: false,
      key: "course_image",
      render: (_, { course_image, id }) => (
        <>
          <div className="flex-col hidden gap-x-4 sm:flex">
            <Link href={`/dashboard/courses/${id}`}>
              <Image preview={false} className="max-w-10 max-h-10 rounded sm:max-w-14 sm:max-h-14" src={course_image as string} alt="Image not found" />
            </Link>
          </div>

        </>
      ),
    },
    {
      title: "name",
      dataIndex: "name",
      sorter: true,
      key: "id",
      render: (_, { name, id }) => (
        <>
          <div className="flex-col hidden gap-x-4 sm:flex">
            <div className="font-semibold">{name}</div>
          </div>
          <div className="flex-col gap-x-4 sm:hidden">

            <Link href={`/dashboard/courses/${id}`}>
              {name}
            </Link>
          </div>
        </>
      ),
    },



    {
      title: "Status",
      dataIndex: "Status",
      key: "status",
      sorter: true,
      render: (_, { course_status, id }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {/* {course_status} */}
              {course_status === Course_Status.DRAFT ? 'DRAFT' : course_status === Course_Status.PUBLISHED ? 'Published' : 'READY FOR PUBLISHING'}

            </div>
          </div>
        </>
      ),
    },
    {
      title: "Enrollment’s",
      dataIndex: "enrolled_count",
      key: "enrolled_count",
      sorter: true,
      render: (_, { enrolled_count }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {enrolled_count}
            </div>
          </div>
        </>
      ),
    },

    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      sorter: true,
      render: (_, { rating }) => (
        <>
          <div className="flex flex-row gap-x-4 sm:flex-col">
            <div className="font-semibold">
              {rating || 0}
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
    }

  ];
  const renderMenuItem = (detail: Course) => {
    const items = [
      {
        label: "Edit",
        key: "1",
        onClick: () => {
          assignOrsetNull(setSelectedData, selectedData, detail); setCreateNewCourse(!createNewCourse)
        },
        visible: authorize.canUpdate("courses"),
      },
      {
        label: (
          <Popconfirm
            title="Delete the Course"
            description="Are you sure to delete this Course?"
            onConfirm={() => deleteCourse(detail)}
            okText="Yes"
            cancelText="No"
          >
            delete
          </Popconfirm>
        ),
        key: "2",
        visible: authorize.canDelete("courses"),
      },
      {
        label: "Request Publish",
        key: "1",
        onClick: () => courseRequestPublish(detail.id)
        ,
        visible: detail.course_status === Course_Status.DRAFT,
      },
    ];

    return items.filter((item) => item.visible != false);
    // return items;
  };
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection: TableRowSelection<Course> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };


  return <>

    <div className="container mx-auto ">
      <ListHeader title="My Courses" addTitle="Add New Course" add={(() => setCreateNewCourse(!createNewCourse))} />

      <div className="flex flex-wrap">
        <div className="flex flex-wrap flex-1 pb-20 mr-0 h-fit">
          <div className="flex flex-wrap items-center w-full gap-4 mt-5 text-center">
            <SearchBar components={components} filteredData={paginator.filterData} handleChange={paginator.handleChange} />
          </div>

          <div className="flex flex-row items-center w-full gap-4 py-3 text-gray-500 ml-2">
            <Checkbox />
            <button onClick={searchCourses}>
              <i>
                <FaRedo />
              </i>
            </button>
            <i>
              <FaEllipsisV />
            </i>
            {selectedData && <Button className='p-0 font-semibold border-none'
              onClick={() => setOpenModel(selectedData.id)} ><FaTrashAlt className='p-0' /></Button>}
          </div>
          <div className={`fixed top-0 left-0 right-0 z-50
         bg-slate-300 bg-opacity-80 flex flex-wrap items-center justify-center
           w-full p-4 
           overflow-x-hidden 
           overflow-y-auto md:inset-0 h-modal md:h-full  transition ease-in-out duration-1000 ${openModel === "" ? "hidden" : 'block'}`}
          >
            <Modal setOpenModel={setOpenModel} deleteMethod={deleteCourse} />
          </div>
          <div className="relative w-full">
            <Loading {...loading} />
            {/* {courses?.map(course =>
            <CustomCard  key={course.id} className={`${selectedData?.id === course.id && ' border-custom_orange-900'} relative`}>

                    <div className="flex flex-wrap items-center justify-between max-w-[720px] group ">
                       <Button className='absolute top-0 items-center hidden p-2 ml-auto text-sm bg-transparent rounded-lg text-custom_orange-700 right-8 hover:bg-custom_orange-800 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white group-hover:flex ' 
                            onClick={() =>{assignOrsetNull(setSelectedData, selectedData, course); setCreateNewCourse(!createNewCourse) 
                            }} >
                            <FaEdit  />  
                      </Button>

                      <button type="button"
                        className="text-custom_orange-700 bg-transparent absolute top-1 right-1
                        hover:bg-custom_orange-800 hover:text-gray-900 rounded-lg 
                        text-sm p-1.5 ml-auto items-center dark:hover:bg-gray-600
                        dark:hover:text-white hidden group-hover:flex " onClick={() => setOpenModel(course.id)} >
                 
                         <FaTimesCircle />
                            <span className="sr-only">Close modal</span>
                        </button>

                        <div className="grid items-center grid-cols-3 ml-3 md:grid-cols-5 gap-y-4 md:gap-y-0">
                            <div className="h-full row-span-2 mr-5 lg:mb-0">
                                <Link href={`/dashboard/courses/${course.id}`}>
                                    <Image preview={false} className="w-20 h-20 rounded sm:w-24 sm:h-24" src={course.course_image as string} alt="Image not found" />
                                </Link>
                            </div>
                             <div className="flex flex-row flex-wrap items-center w-full col-span-2 row-span-2 md:row-span-1 md:col-span-4 sm:justify-between gap-x-2 lg:mt-0 ">

                                <h3 className="self-start text-lg font-bold ">
                                    {course?.name}
                                </h3>
                                <div className="flex flex-wrap self-start justify-start gap-2 mb-0 sm:gap-4">
                                    <span className="bg-custom_orange-100 text-custom_orange-700 px-4 py-0.5 rounded-3xl text-center text-sm" >{getLabelByValue(courseType, course.course_type)}</span>
                                    <span className="px-4 py-0.5 mr-2 bg-orange-400 rounded-3xl text-center text-sm" >{getLabelByValue(courseLevel, parseInt(course.course_level))}</span>

                                    <span className=" mr-2 bg-gray-300 text-blue-500 px-4 py-0.5 rounded-3xl text-center text-sm" >{getLabelByValue(courseStatus, course.course_status!)}</span>
                                    {course.course_status === Course_Status.DRAFT && <button className="self-center px-1 py-1 bg-gray-200 rounded-lg text-custom_orange-800" onClick={() => courseRequestPublish(course.id)}>Request Publish</button>}
                                </div>
                            </div>
                        
                        <div className={`flex flex-wrap item-center col-span-3 md:col-span-4  mt-0 sm:mt-10 justify-start gap-2 sm:gap-4  ${props.visibleMenuList ? 'mt-10' : 'mt-0 lg:mt-10'}`}>
                            <div className="flex flex-col items-center justify-center h-10 p-1 text-xs bg-gray-300 rounded-lg w-36 lg:36 xl:w-44">
                                <p className="text-md ">Earned</p>
                                <span className="font-bold text-blue-600 text-md">$5,68.00</span>
                            </div>
                            <div className="flex flex-col items-center justify-center h-10 p-1 text-xs rounded-lg w-36 lg:36 bg-custom_orange-100 xl:w-44">
                                <p className="text-md ">Enrollment’s</p>
                                <span className="font-bold text-md ">{course.enrolled_count}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center h-10 p-1 text-xs bg-red-100 rounded-lg w-36 lg:36 xl:w-44">
                                <p className="text-md ">Course Rating</p>
                                <span>
                                    <div className="flex items-center gap-1">
                                        <p className="ml-2 font-medium text-yellow-600 text-md dark:text-gray-400">{course.rating || '0.0'}</p>
                                        <Rating  rating={course.rating || 0} widthHeight="w-3 h-3" />
                                    </div>
                                </span>
                            </div>
                        </div>
                     </div>
                    </div>
                </CustomCard>
                )} */}

            <CustomTable
              rowSelection={rowSelection}
              columns={coursesColumns}
              dataSource={courses}
              onChange={paginator.onSortChange}
              updateRowSelected={setSelectedRowKeys}
              pagination={false}
              rowKey="id"
              header="id"
            />
            <div className="flex items-center justify-end mt-4">
              <Pagination {...paginator} />
            </div>
          </div>
          <hr className="w-full mt-2" />
          {/* {courses.length ?  <Pagination  {...paginator} className="w-full"/> : <Empty className="flex justify-center w-full"/>} */}
        </div>
        {(createNewCourse || selectedData) && <div className="flex-1 hidden md:block">
          <CourseAdd courseData={selectedData} searchCourses={searchCourses} cancel={cancel} />
        </div>}
      </div>
    </div>

    <Dialog open={createNewCourse} onCancel={cancel} footer={[]} width={IsWindowUndefined() && window?.innerWidth < 768 ? "100%" : "80%"}
      height={IsWindowUndefined() && window?.innerWidth < 768 ? "100%" : "80%"} >
      <CourseAdd courseData={selectedData} searchCourses={searchCourses} cancel={cancel} />
    </Dialog>
    <Dialog open={open} destroyOnClose width={880} className="w-full" onCancel={() => setOpen(false)}
      footer={[<Button type="button" key={generateUniqueKey()} className="px-3 py-1 text-white bg-blue-500 rounded-md" onClick={() => setOpen(false)}> Okay </Button>,]} >
      {courseMissing && <CourseMissing data={courseMissing} />}
    </Dialog>
  </>
}
export default CoursesList