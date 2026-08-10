import { useEffect, useState } from "react";
import {
    Content,
    Question,
    UserAnswers,
} from "../../../types/Course";
import useQuestionService, {
    QuestionTableSearchModel,
} from "./QuestionService";
import { usePagination } from "../../customs/pagination/usePagination";
import { Card, Checkbox, ConfigProvider, message, Radio } from "antd";
import { AnswerTypeEnum } from "../../../types/Enums";
import "./question.css";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
const labels = ['A', 'B', 'C', 'D','E','F','G','H','I'];
import "./question.css";
interface Props {
    content: string;
    student?: string;
    index?: number;
}

const QuestionUserAnswer = ({ content, student, index }: Props) => {
    const questionService = useQuestionService();
    const [questions, setQuestion] = useState<Question[]>([]);
    const paginator = usePagination<QuestionTableSearchModel>({method: 'user_answer', content_id: content, index:index, student: student});
    const [pn, setPn] = useState(0);
    const user = useSelector((state: AppState) => state.user);

    useEffect(() => {
        const blockCopyPaste = (e: any) => {
            if (e.ctrlKey && (e.key === "c" || e.key === "v")) {
                e.preventDefault();
            }
        };

        document.addEventListener("keydown", blockCopyPaste);
        document.addEventListener("keydown", function (event) {
            if (event.key === "PrintScreen") {
                event.preventDefault();
                alert("Screenshot is disabled!");
            }
        });

        return () => {
            document.removeEventListener("keydown", blockCopyPaste);
        };
    }, []);
    useEffect(() => {
        content && searchQuestion();
    }, [paginator.filterData, content]);
    const disableRightClick = (e: any) => {
        e.preventDefault();
    };

    const searchQuestion = () => {
        questionService
            .getQuestions(paginator.filterData)
            .then(({ data: response }) => {
                setQuestion(response.results);
                paginator.setTotal(response.count);
                paginator.setNext(response.next);
                paginator.setPrevious(response.previous);
            });
    };



    return (
        <>
            <div className=" p-10 sensitiveContent">
                {/* <Card>{content.description}</Card> */}

                <div className="watermark text-gray-100">
                    <div>
                        <h1 className="text-gray-200 text-3xl font-extrabold ">
                            Company:{" MyTutor Tutoring platform"}
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-gray-200 text-3xl font-extrabold">
                            User:{user?.full_name}( {user?.email})
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-gray-200 text-3xl font-extrabold">Time:{new Date().toLocaleString()}</h1>{" "}
                    </div>
                </div>
                {questions ? (
                    questions.map(
                        (question, index) =>
                            index - 5 * pn < 5 &&
                            index - 5 * pn >= 0 && (<div key={index}>
                                <ul >
                                    <li className="mb-2">
                                        <div
                                            className="text-[16px] flex mb-1 gap-1 font-bold noSelect"
                                            onContextMenu={disableRightClick}
                                        >
                                            {index + 1}.{" "}
                                            <span
                                                className="flex font-bold"
                                                dangerouslySetInnerHTML={{ __html: question.question }}
                                            />
                                        </div>
                                      
                                            {question.answer_type === AnswerTypeEnum.SINGLE ? (
                                                  <ConfigProvider
                                                  theme={{
                                                      token: {
                                                          colorPrimary: `${question.user_answer?.[0].is_correct
                                                                  ? "green"
                                                                  : question.user_answer?.[0].is_correct == false
                                                                      ? "red"
                                                                      : "#1677ff"
                                                              }`,
                                                      },
                                                  }}
                                              >
                                                <Radio.Group
                                                    value={question.user_answer?.[0].answer}
                                                    options={question.options_questions.map((val,ind) => ({
                                                        label: (
                                                            <div
                                                                className="flex answer  ml-3  noSelect"
                                                                onContextMenu={disableRightClick}
                                                                dangerouslySetInnerHTML={{ __html: `${labels[ind] } `+ " , " +  `  ${val.value}` }}
                                                            />
                                                        ),
                                                        value: val.id,
                                                    }))}
                                                />
                                                </ConfigProvider>
                                            ) : (<Checkbox.Group
                                                     value={question.user_answer?.map((value) => value.answer) }
                                                >
                                                    {question.options_questions.map((val,ind) => (
                                                        <ConfigProvider
                                                        key={val.id}
                                                        theme={{
                                                            token: {
                                                                colorPrimary: `${question.user_answer.find(value =>  value.answer == val.id)?.is_correct
                                                                        ? "green"
                                                                        : question.user_answer.find(value =>  value.answer == val.id)?.is_correct == false
                                                                            ? "red"
                                                                            : "#1677ff"
                                                                    }`,
                                                            },
                                                        }}
                                                        >
                                                        <Checkbox 
                                                    value={val.id}
                                                    >
                                                        <div
                                                                className="flex items-center justify-center"
                                                                dangerouslySetInnerHTML={{ __html: `${labels[ind] } `+ " , " +  `  ${val.value}` }}
                                                           
                                                            />
                                                    </Checkbox>
                                                    </ConfigProvider>))}
                                                </Checkbox.Group>
                                            )}
                                       
                                    </li>
                                </ul>

                              <div className="flex flex-col items-start mb-6 mt-2">
                                <h5 className="">(Answer) Explanation</h5>
                                 <ul> {
                                   question.answer_question
                                   ?.map((value,index)=><li className="pl-3 flex p-0  text-[12px] " key={value.id}>
                                    {index + 1} , 
                                    (<span className="text-p"
                                                                 dangerouslySetInnerHTML={{ __html:`  ${value.value} ` }}></span>)
                                                               <span>  {value.explanation}</span> 
                                    </li>) 
                                  }
                                </ul>
                              </div>

                            </div>
                            )
                    )
                ) : (
                    <h1>There is no any questions here</h1>
                )}

                <div className="flex gap-6">
                    {pn > 0 && (
                        <button
                            className="bg-gray-200 self-center text-custom_orange-800 px-3 py-2 mt-3 rounded-lg"
                            onClick={() => setPn(pn - 1)}
                        >
                            Previous
                        </button>
                    )}

                    {(paginator.total) >
                        pn * 5 + 5 && (
                            <button
                                className="bg-gray-200 self-center text-custom_orange-800 px-3 py-2 mt-3 rounded-lg"
                                onClick={() => setPn(pn + 1)}
                            >
                                Next
                            </button>
                        )}

                
                </div>
            </div>
        </>
    );
};

export default QuestionUserAnswer;
