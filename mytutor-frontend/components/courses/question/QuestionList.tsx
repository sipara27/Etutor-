import { useEffect, useState } from "react";
import {
  Content,
  Question,
  UserAnswers,
  UserQuizeResultsType,
} from "../../../types/Course";
import useQuestionService, {
  QuestionTableSearchModel,
} from "./QuestionService";
import { usePagination } from "../../customs/pagination/usePagination";
import { changeDuration } from "../../../utils/modal";
import { Card, Checkbox, ConfigProvider, message, Radio } from "antd";
import { AnswerTypeEnum } from "../../../types/Enums";
import Countdown from "antd/es/statistic/Countdown";
import { Progress } from "../../../component/course/Questions";
import "./question.css";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";

interface Props {
  content: Content;
  setProgress: (value: number) => void;
  setUserResult: (value: UserQuizeResultsType) => void;
  is_admin?: boolean;
}

const QuestionList = ({
  setProgress,
  content,
  setUserResult,
  is_admin,
}: Props) => {
  const questionService = useQuestionService();
  const [questions, setQuestion] = useState<Question[]>([]);
  const paginator = usePagination<QuestionTableSearchModel>();
  const [pn, setPn] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers[]>([]);
  let time = changeDuration(content.duration);
  const [deadline, setDeadLine] = useState(0);
  const user = useSelector((state: AppState) => state.user);
  const labels = ['A', 'B', 'C', 'D','E','F','G','H','I'];

  useEffect(() => {
   
    setDeadLine(
      Date.now() + 1000 * 60 * 60 * time.hours + 1000 * 60 * time.minutes
    );
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
    content.id && searchQuestion();
  }, [paginator.filterData, content.id]);
  const disableRightClick = (e: any) => {
    e.preventDefault();
  };

  const searchQuestion = () => {
    questionService
      .getQuestions({
        ...paginator.filterData,
        content_id: content.id,
        ps: is_admin ? undefined : content.no_question,
      })
      .then(({ data: response }) => {
        setQuestion(response.results);
        paginator.setTotal(response.count);
        paginator.setNext(response.next);
        paginator.setPrevious(response.previous);
      });
  };

  const onSubmit = () => {
    questionService.addUserAnswer(answers).then(({ data: value }) => {
      setUserResult(value);
      setProgress(Progress.FINISH);
      message.success("successfully submitted");
    }).catch(err=>{
       setProgress(Progress.FINISH);
    });
  };

  const onFinish = () => {
     setDeadLine(0)
     onSubmit();
  };

  const handleChange = (question: string, ans: any[]) => {
    let anrs = answers.filter((value) => value.question !== question);
    anrs = anrs.concat(
      ans.map((val) => ({ question, answer: val } as UserAnswers))
    );
   
    setAnswers(anrs);
    
  };

  return (
    <>
      <div className=" p-10 sensitiveContent">
        {is_admin ? (
          <Card>{content.description}</Card>
        ) : (
          <div className="w-full pb-2">
            <Countdown
              title={
                <span className="font-semibold text-black text-xl w-20">
                  Remaining Time
                </span>
              }
              value={deadline}
              onFinish={onFinish}
           
            />
          </div>
        )}
        <div className="watermark text-gray-100">
          <div>
            <h1 className="text-gray-100 text-5xl font-extrabold ">
              Company:{" MyTutor Tutoring platform"}
            </h1>
          </div>
          <div>
            <h1 className="text-gray-100 text-5xl font-extrabold">
              User:{user?.full_name}( {user?.email})
            </h1>
          </div>
          <div>
            <h1 className="text-gray-100 text-5xl font-extrabold">Time:{new Date().toLocaleString()}</h1>{" "}
          </div>
        </div>
        {questions ? (
          questions.map(
            (question, index) =>
              index - 5 * pn < 5 &&
              index - 5 * pn >= 0 && (
                <ul key={index}>
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
                    <ConfigProvider
                      theme={{
                        token: {
                          colorPrimary: `${
                            question.is_correct
                              ? "green"
                              : question.is_correct == false
                              ? "red"
                              : "#1677ff"
                          }`,
                        },
                      }}
                    >
                      {question.answer_type === AnswerTypeEnum.SINGLE ? (
                        <Radio.Group
                          onChange={(e) =>
                            handleChange(question.id, [e.target.value])
                          }
                          disabled={deadline===0}
                          value={
                            question.answers
                              ? question.answers.find((value) => value.question)
                                  ?.answer
                              : answers.find(
                                  (value) => value.question === question.id
                                )?.answer
                          }
                          options={question.options_questions.map((val,ind) => ({
                            label: (
                              <div
                              className="flex answer ml-3 min-w-72 max-w-72 noSelect"
                              onContextMenu={disableRightClick}
                              dangerouslySetInnerHTML={{ __html: `${labels[ind] } `+ " , " +  `  ${val.value}` }}
                            />
                            ),
                            value: val.id,
                          }))}
                        />
                      ) : (
                        <Checkbox.Group
                          disabled={deadline===0}
                          options={question.options_questions.map((val,ind) => ({
                            
                            label: (
                              <div
                                className="flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: `${labels[ind]}. ${val.value}` }}
                              />
                            ),
                            value: val.id,
                          }))}
                          value={
                            question.answers
                              ? question.answers
                                  .filter((value) => value.question)
                                  ?.map((value) => value.answer)
                              : answers
                                  .filter((val) => val.question === question.id)
                                  .map((val) => val.answer)
                          }
                          onChange={(value) => handleChange(question.id, value)}
                        />
                      )}
                    </ConfigProvider>
                  </li>
                </ul>
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

          { paginator.total >
            pn * 5 + 5 && (
            <button
              className="bg-gray-200 self-center text-custom_orange-800 px-3 py-2 mt-3 rounded-lg"
              onClick={() => setPn(pn + 1)}
            >
              Next
            </button>
          )}

          {!is_admin &&
            answers.length > 0 &&
            new Set(answers.map((value) => value.question)).size >=
              Math.min(
                content.no_question || paginator.total,
                paginator.total
              ) && (
              <button
                type="button"
                onClick={onSubmit}
                className="bg-gray-200 self-center text-custom_orange-800 px-3 py-2 mt-3 rounded-lg"
                disabled={deadline===0}
              >
                {" "}
                Submit{" "}
              </button>
            )}
        </div>
      </div>
    </>
  );
};

export default QuestionList;
