import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Result } from "antd";
import { Content, UserQuizeResultsType } from "../../../types/Course";
import { Progress } from "../../../component/course/Questions";
import QuestionUserAnswer from "./QuestionUserAnswer";
import QuestionUserResults from "./QuestionUserResults";

interface Props {
  content: Content;
  handleNext: () => void;
  handlePrevious: () => void;
  setProgress: (value: number) => void;
  userResult: UserQuizeResultsType;
}

const QuestionResult = ({
  content,
  handleNext,
  handlePrevious,
  setProgress,
  userResult,
}: Props) => {
  const subTitle = (
    <div>
      <h1>
        Result:{" "}
        <span>
          {userResult.result}/{userResult.total}(
          {((userResult.result * 100) / userResult.total).toFixed(2)}%)
        </span>
      </h1>
      <h1>
        Passing Result in percent: <span>{content.passing_percent || 0}%</span>{" "}
      </h1>
    </div>
  );

  return (
    <>
      <div>
        {userResult.is_passed ? (
          <Result
            status="success"
            title="You have successfully passed the exam!"
            subTitle={subTitle}
            extra={[
              <div className="flex flex-col gap-2" key={userResult.id}>
                <div className="flex justify-evenly gap-2">
                  <Button
                    type="primary"
                    className="border-2 border-gray-100 hover:bg-custom_orange-700  border-solid text-white"
                    key="previous"
                    onClick={handlePrevious}
                  >
                    <ArrowLeftOutlined />
                    Previous Content
                  </Button>,
                  <Button
                    type="primary"
                    className="border-2 border-gray-100 hover:bg-custom_orange-700  border-solid text-white"
                    key="previous"
                    onClick={() => setProgress(Progress.EXAM)}
                  >
                    <ReloadOutlined />
                    Retake Again
                  </Button>,
                  <Button
                    type="primary"
                    className="border-2 border-gray-100 hover:bg-custom_orange-700  border-solid text-white"
                    onClick={handleNext}
                    key="next"
                  >
                    Next Content <ArrowRightOutlined />
                  </Button>,
                </div>
                <QuestionUserResults content={content.id} />
              </div>
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Exam Failed"
            subTitle={subTitle}
            extra={[
              <div key={userResult.id}>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="primary"
                    className="border-2 border-gray-200  border-solid text-black"
                    key="previous"
                    onClick={handlePrevious}
                  >
                    Previous Content
                  </Button>,
                  <Button
                    type="primary"
                    className="border-2 border-gray-200  border-solid text-black"
                    key="retake"
                    onClick={() => setProgress(Progress.INTRO)}
                  >
                    Re-take Exam
                  </Button>,
                </div>
                <QuestionUserResults content={content.id} />
              </div>
            ]}
          >

          </Result>
        )}
      </div>
    </>
  );
};

export default QuestionResult;
