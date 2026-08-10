import useAuthorization from "@/components/account/auth/authorization"
import useQuestionService from "./QuestionService";
import { useEffect, useState } from "react";
import { UserQuizeResultsType } from "@/types/Course";
import { Button, Card } from "antd";
import { toDate, toDateAndTime } from "@/utils/timeUtils";
import QuestionUserAnswer from "./QuestionUserAnswer";

interface Props {
    content: string;
    user?: string;
}

const QuestionUserResults = (props: Props) => {
    const authorize = useAuthorization();
    const [showDetail, setShowDetail] = useState("");
    const questionService = useQuestionService();
    const [userResults, setUserResults] = useState<UserQuizeResultsType[]>([]);

    useEffect(() => {
        searchQuestionResult();
    }, [])

    const searchQuestionResult = () => {
        questionService.getQuizeResults({ content_id: props.content, user: props.user, method: 'self' }).then(({ data: value }) => {
            setUserResults(value.results)
        })
    }

    return <div className="flex flex-col gap-2 container">
        {userResults.map(value => <div key={value.id} className="px-2 rounded-md  border-gray-300 border m-0" >
            <div className="flex gap-10 text-start justify-start items-start ">

                <div>
                    <div>{value.index + 1}, {value.user_name}</div>
                    <time>{toDateAndTime(value.create_date)}</time>
                </div>
                <div>

                    {value.is_passed ? <div className="text-green-700">Passed</div> : <div className="text-red-700">Failed</div>}
                    <div>Result: {value.result}</div>
                </div>
            </div>

            {showDetail == value.id && <QuestionUserAnswer index={value.index} content={props.content} />}
            <Button className="mb-2" onClick={() => value.id == showDetail ? setShowDetail("") : setShowDetail(value.id)}>{showDetail == value.id ? 'Show Less' :  'Show Detail'}</Button>
        </div>)}
    </div>

}

export default QuestionUserResults;