import React, { useContext, useEffect, useState } from "react";
import { FaPlus, FaDownload } from "react-icons/fa";
import { Modal, Empty } from "antd";
import CustomCard from "../../customs/custom-card/CustomCard";
import { assignOrsetNull } from "../../../utils/modal";
import { usePagination } from "../../customs/pagination/usePagination";
import { EducationalLevel } from "../../../types/Enums";
import { useEducationBackgroundService } from "./EducationBackgroundService";
import { EducationalBackground } from "./EducationBackgroundModel";
import EducationBackgroundAdd from "./EducationBackgroundAdd";
import { EducationBackgroundFilterModel } from "./EducationBackgroundModel";
import { useSelector } from "react-redux";
import { AppState } from "@/state/store/store";
import { UserIdContext } from "../auth/UserPages";
import CustomPopConfirm from "../../customs/custom-modals/CustomPopConfirm";
import useAuthentication from "../auth/authentication";
import { UserContext } from "../../../component/course/ProfileInstructor";
import { formatBytes, IsWindowUndefined } from "../../../utils/func_utils";
import useLoading from "../../customs/loading/LoadingHook";
import Loading from "../../customs/loading/Loading";

export interface Props {
  setEducationalBackgroundData: React.Dispatch<
    React.SetStateAction<EducationalBackground[]>
  >;
  show_add?: boolean;
}
const EducationBackgroundList = ({
  show_add = false,
  setEducationalBackgroundData,
}: Props) => {
  let pageSizeList = [5, 10, 20, 25];
  const [data, setData] = useState<EducationalBackground[]>([]);
  const [showAdd, setShowAdd] = useState(show_add);
  const loading = useLoading();
  const [selectedData, setSelectedData] = useState<EducationalBackground>();
  const user = useSelector((state: AppState) => state.user);
  const { userId } = useContext(UserContext);
  const { registeredUserId } = useContext(UserIdContext);
  const authentication = useAuthentication();
  const paginator = usePagination<EducationBackgroundFilterModel>({
    user_id: registeredUserId ? registeredUserId : userId ? userId : user.id,
    ps: 5,
  });
  const educationBackgroundService = useEducationBackgroundService();

  const cancel = () => {
    setShowAdd(false);
    setSelectedData(undefined);
  };

  useEffect(() => {
    searchEducationBackgrounds();
  }, [paginator.filterData]);

  const searchEducationBackgrounds = () => {
    loading.startLoading();
    educationBackgroundService
      .getEducationBackgrounds(paginator.filterData)
      .then((value) => {
        let data = value.data.results;
        setData(data);
        setEducationalBackgroundData(data);
        // setShowAdd(data.length?false:true)
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  const deleteData = (selectedData: EducationalBackground) => {
    
    loading.startLoading();
    educationBackgroundService
      .deleteEducationBackground(selectedData!)
      .then((value) => {
        setData(value.data.results);
        searchEducationBackgrounds();
        setSelectedData(undefined);
        loading.stopLoading();
      })
      .catch(() => {
        loading.stopLoading();
      });
  };

  return (
    <>
      <div className="container mx-auto flex flex-col max-h-full ns-card mt-5 ">
        <div className="flex flex-row">
          <div className="flex justify-start mx-1 text-2xl">
            Education background
          </div>
          <div className="flex justify-self-end">
            <div className="items-center">
              <button
                onClick={() => {
                  setShowAdd(!showAdd);
                  setSelectedData(undefined);
                }}
                className="w-20 h-10 hover:bg-custom_orange-800 rounded-md hover:text-white flex items-center justify-center"
              >
                <FaPlus className="" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="container relative mx-auto flex flex-wrap justify-center items-center">
            <Loading {...loading} />
            {data?.map((education_background: EducationalBackground) => (
              <div
                key={education_background.id}
                className="max-w-md  md:mx-20 lg:mx-1 group relative"
              >
                {authentication.isLoggedIn() && (
                  <CustomPopConfirm
                    func={() => {
                      deleteData(education_background);
                      setSelectedData(education_background);
                    }}
                    editFun={setShowAdd}
                  />
                )}
                <CustomCard
                  className={`${
                    selectedData?.id === education_background.id &&
                    " border-custom_orange-900"
                  } min-w-[200px]`}
                >
                  <div
                    className="flex w-full justify-between pl-3 text-center hover:cursor-pointer"
                    onClick={() => {
                      authentication.isLoggedIn() &&
                        assignOrsetNull(
                          setSelectedData,
                          selectedData,
                          education_background
                        );
                    }}
                  >
                    <div className="flex flex-col items-center lg:mt-0 pr-6">
                      <h3 className="text-lg self-start ">
                        {education_background?.field_of_study}(
                        {
                          // EducationalLevel.find(
                          //   (val) =>
                          //     val.value ===
                          //     education_background?.level_of_education
                          // )?.label
                          
                        }
                        {education_background.level_of_education_name}
                        ) / {education_background?.school_of_education}
                      </h3>
                      <p>
                        ({education_background?.start_date} -{" "}
                        {!education_background.currently_learning
                          ? education_background?.year_of_graduation
                          : "Currently Learning"}
                        )
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${education_background?.document_url}`}
                    target="_blank"
                  >
                    <FaDownload className="text-gray-400 text-3xl w-10" />
                    {education_background?.file_name} (
                    {formatBytes(education_background?.file_size!, 0.2)})
                  </a>
                  {/* <button onClick={()=>handleDownload(education_background.document_url!)}>
                                <FaDownload className="text-gray-400 text-3xl w-10"/>
                              </button> */}
                </CustomCard>
              </div>
            ))}
            {data?.length === 0 ? <Empty className="my-20" /> : ""}
          </div>
          {showAdd || selectedData ? (
            <div className="container mx-auto flex-wrap hidden md:block justify-center ">
              <EducationBackgroundAdd
                searchEducationalBackground={searchEducationBackgrounds}
                educationalBackgroundDetail={selectedData}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <Modal
        open={showAdd && IsWindowUndefined() && window?.innerWidth < 768}
        onCancel={cancel}
        footer={[]}
      >
        <EducationBackgroundAdd
          searchEducationalBackground={searchEducationBackgrounds}
          educationalBackgroundDetail={selectedData}
        />
      </Modal>
    </>
  );
};

export default EducationBackgroundList;
