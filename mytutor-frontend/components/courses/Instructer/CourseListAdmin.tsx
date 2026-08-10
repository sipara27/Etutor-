"use client"
import { useEffect, useState } from "react";
import useCourseService from "../course/CourseService"
import { usePagination } from "../../customs/pagination/usePagination";
import { Course, CourseMissingType, CourseTableSearchModel } from "../../../types/Course";
import { Button, Card, Dropdown, Empty, Modal, Pagination, Image, Popconfirm } from "antd";
import { SearchComponentProps } from "../../commons/search-bar/search";
import { Course_Status, componentType, courseLevel, courseStatus, courseType } from "../../../types/Enums";
import SearchBar from "../../commons/search-bar/SearchBar";
import CustomText from "../../customs/custom-text/CustomText";
import { getLabelByValue } from "../../../utils/array";
import CourseMissing from "../course/CourseMissing";
import useLoading from "../../customs/loading/LoadingHook";
import Loading from "../../customs/loading/Loading";
import { generateUniqueKey } from "@/utils/func_utils";
import Link from "next/link";
import { CaretDownOutlined, MoreOutlined } from "@ant-design/icons";
import Table, { ColumnsType } from "antd/es/table";
import useAuthorization from "@/components/account/auth/authorization";
import CustomTable from "@/components/commons/Table/Table";
import { TableRowSelection } from "antd/es/table/interface";

const CourseListAdmin = () => {
    const courseService = useCourseService();
    const [courseMissing, setCourseMissing]= useState<CourseMissingType>();
    const [open, setOpen] = useState(false);
    const [courseDatas, setCourseDatas] = useState<Course[]>([])
    const loading = useLoading();
    const paginator = usePagination<CourseTableSearchModel>({ course_status: Course_Status.READY_FOR_PUBLISHING })
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
    ]

    const coursePublish = (id: string) => {
        loading.startLoading();
        courseService.courseAdminDo(id, "publish").then(({data:value}) => {
            if(value.invalid){
                setCourseMissing(value as any)
                setOpen(true)
            }else {
                searchCourses()
            }
            loading.stopLoading();
        }).catch(loading.stopLoading)
    }

    useEffect(() => {
        searchCourses()
    }, [paginator.filterData])
    const searchCourses = () => {
        loading.startLoading();
        courseService.getCourses(paginator.filterData).then(({ data: response }) => {
            setCourseDatas(response.results)
            loading.stopLoading();
            paginator.setTotal(response.count)
        }).catch(loading.stopLoading)
    }

    const courseColumns: ColumnsType<Course> = [
        
        {
            title: "Image",
            dataIndex: "course_image",
            sorter: false,
            key: "id",
            render: (_, { course_image,id }) => (
              <>
                <div className="flex-col hidden gap-x-4 sm:flex">
                <Link href={`/dashboard/course_publish/${id}`}>
    <Image preview={false} className="max-w-10 max-h-10 rounded sm:max-w-14 sm:max-h-14" src={course_image as string} alt="Image not found" />
</Link>
                </div>
                {/* <div className="flex-col gap-x-4 sm:hidden">
              
              <Link href={`/dashboard/course_publish/${id}`}>
              <Image preview={false} className="max-w-10 max-h-10 rounded sm:max-w-14 sm:max-h-14" src={course_image as string} alt="Image not found" />

             </Link>
            </div> */}
               
              </>
            ),
          },
        {
          title: "name",
          dataIndex: "name",
          sorter: true,
          key: "id",
          render: (_, { name,id }) => (
            <>
              <div className="flex-col hidden gap-x-4 sm:flex">
                <div className="font-semibold">{name}</div>
              </div>
              <div className="flex-col gap-x-4 sm:hidden">
              
                <Link href={`/dashboard/course_publish/${id}`}>
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
          render: (_, { course_status,id }) => (
            <>
              <div className="flex flex-row gap-x-4 sm:flex-col">
                <div className="font-semibold">
                  {/* {course_status} */}
                  {course_status === Course_Status.DRAFT?'DRAFT':course_status===Course_Status.PUBLISHED?'Published':'READY FOR PUBLISHING'}
                              
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
        },  {
          title: "Content Detail",
          dataIndex: "content_detail",
          key: "content_detail",
          sorter: true,
          render: (_, { id }) => (
            <>
              <div className="flex flex-row gap-x-4 sm:flex-col">
                <div className="font-semibold">
                <Link className="bg-gray-200  text-custom_orange-800 px-3 py-2 rounded-lg" href={"/dashboard/course_publish/" + id}>View Detail</Link>
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
            label: (
              <Popconfirm
                title="Publish the Course"
                description="Are you sure to Publish this Course?"
                 onConfirm={() => coursePublish(detail.id)}
                okText="Yes"
                cancelText="No"
              >
                Publish
              </Popconfirm>
            ),
            key: "2",
             visible: authorize.canUpdate("courses"),
          },
      
        ];
    
         return items.filter((item) => item.visible != false);
        // return items;
      };
      const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      }

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

    return <div className="sm:px-5 sm:pr-20 pt-5 flex-col gap-2 flex">
        <div className="flex items-center flex-wrap gap-5 pb-4">
            <h1 className="text-xl">Course <CustomText className="" text="List" /></h1>
            <SearchBar filteredData={paginator.filterData} handleChange={paginator.handleChange} components={components} />
        </div>
        {/* <div className="flex flex-col relative sm:grid grid-cols-2 gap-2"> */}
            <Loading  {...loading} />
            {/* {courseDatas.map((course, index) => <Card key={course.id}>
                <div className="flex flex-col  sm:grid grid-cols-4">
                    <div className="col-span-3">
                        <div className="p-1 text-lg font-semibold">{course.name}</div>
                        <div className="flex flex-wrap  self-start mb-0  justify-start gap-2 sm:gap-4">
                                    <span className="bg-custom_orange-100 text-custom_orange-700 px-4 py-0.5 rounded-3xl text-center text-sm" >{getLabelByValue(courseType, course.course_type)}</span>
                                    <span className="px-4 py-0.5 mr-2 bg-orange-400 rounded-3xl text-center text-sm" >{getLabelByValue(courseLevel, parseInt(course.course_level))}</span>
                                    <span className=" mr-2 bg-gray-300 text-blue-500 px-4 py-0.5 rounded-3xl text-center text-sm" >{getLabelByValue(courseStatus, course.course_status!)}</span>
                                </div>
                        <div className="flex gap-2">
                            <span className="font-semibold">Instructors:</span>
                            <div>
                                {course.instructor.map(value => <div key={generateUniqueKey()}>{value["first_name"]} {value["middle_name"]}</div>)}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-start">
                        <Link className="bg-gray-200  text-custom_orange-800 px-3 py-2 rounded-lg" href={"/dashboard/course_publish/" + course.id}>View Detail</Link>
                        {course.course_status === Course_Status.READY_FOR_PUBLISHING && <button name="Publish" className="bg-gray-200 text-custom_orange-800 px-3 py-2 rounded-lg" onClick={() => coursePublish(course.id)} />}
                    </div>
                </div>
            </Card>)} */}

            <CustomTable
        rowSelection={rowSelection}
        columns={courseColumns}
        dataSource={courseDatas}
        onChange={paginator.onSortChange}
        updateRowSelected={setSelectedRowKeys}
        pagination={false}
        rowKey="id"
        header="id"
      />
        {/* </div> */}

       {courseDatas.length && <Pagination  {...paginator} /> }

       <Modal open={open} destroyOnClose width={880} className="w-full" onCancel={() => setOpen(false)}
       footer={[
        <Button key={generateUniqueKey()} className="bg-blue-500 text-white rounded-md px-3 py-1" onClick={()=> setOpen(false)}>
        Okay
      </Button>,]} >
       {courseMissing && <CourseMissing  data={courseMissing} />}
        </Modal>   
    </div>
}

export default CourseListAdmin