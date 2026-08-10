import { useEffect, useState } from "react";
import { Table, TableColumnsType } from "antd";
import { UserQuizeResultsType } from "../../../types/Course";
import useQuestionService from "../question/QuestionService";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";


const UserCourseResultDetail = () => {
    const questionService = useQuestionService()
    const [courseResultDetail, setCourseResultDetail] = useState<UserQuizeResultsType[]>([])
    const params  = useParams<{course_id:string, user_id:string, user_name:string}>()
    useEffect(() => {
        searchCourseResultDetail()
    },[])

    const searchCourseResultDetail = () => {
        questionService.getQuizeResults({course: params?.course_id, user: params?.user_id}).then(({data: response}) => {
            setCourseResultDetail(response.results)
        })
    }

    const columns: TableColumnsType<UserQuizeResultsType> = [
        {
          title: "Content",
          dataIndex: "content_title",
          key: "content",
          // sorter: (a, b) => a - b,
          sortDirections: ["descend", "ascend"],
        },
        {
          title: "Chapter",
          dataIndex: "chapter_title",
          key: "content",
          // sorter: (a, b) => a - b,
          // sortDirections: ["descend", "ascend"],
        },
        {
            title: "Result",
            dataIndex: "result",
            key: "percent",
            // sorter: (a, b) => a - b,
            // sortDirections: ["descend", "ascend"],
            render: (_, {result, total}) => <span>{result}/{total}({(result * 100 / total).toFixed(2)})</span>
          },
    ]
      

    return <>
   
   <div className="px-3 w-full pt-5 lg:w-3/5">
        <h1  className="text-2xl py-2 px-1 flex items-center gap-2 font-bold text-center"> 
          <FaArrowCircleLeft size={(28)}  onClick={() => {}}/>
          <span>{params?.user_name}s Results.</span> 
        </h1> 
      <Table columns={columns} dataSource={courseResultDetail}  /> 
    </div>
    </>
}

export default UserCourseResultDetail;