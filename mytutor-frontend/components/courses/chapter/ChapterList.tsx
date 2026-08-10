import { FaEllipsisV, FaPlus, FaRedo, FaRegSquare } from "react-icons/fa";
import { Modal as Dialog, Pagination } from "antd";  
import ChapterAdd from "./ChapterAdd";
import { useEffect, useState, useRef } from "react";
import useChapterService, { ChapterTableSearchModel } from "./ChapterService";
import ChapterDetail from "./ChapterDetail";
import { Chapter } from "../../../types/Course";
import { usePagination } from "../../customs/pagination/usePagination";
import useLoading from "../../customs/loading/LoadingHook";
import Loading from "../../customs/loading/Loading";
import { useParams } from "next/navigation";
import { IsWindowUndefined } from "@/utils/func_utils";

function ChapterList({
  addTab,
}: {
  addTab: (tab: string, id: string) => void;
}) {
  const params = useParams();
  const chapterService = useChapterService();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const paginator = usePagination<ChapterTableSearchModel>({course_id: params?.id as string})
  const [addNew, setAddNew] = useState(false)
  const loading = useLoading();
  const [isEdit, setIsEdit] = useState(false);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const hasFetchedRef = useRef<string>(""); // Track last filter to prevent duplicate calls

  // Only fetch when filterData actually changes (not on every render)
  useEffect(() => {
    const filterKey = JSON.stringify(paginator.filterData);
    if (hasFetchedRef.current !== filterKey) {
      hasFetchedRef.current = filterKey;
      searchChapters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginator.filterData]);

  const searchChapters = () => {
    loading.startLoading()
    chapterService.getChapters(paginator.filterData).then(
      ({data: chapters}) => {
          setChapters(chapters.results)
          paginator.setTotal(chapters.count)
          loading.stopLoading()
      }
  ).catch(error => loading.stopLoading())
  }
  const deleteChapter =  (chapterId: string) => {
    chapterService
      .deleteChapter(chapterId)
      .then((res: any) => {
        searchChapters();
      })
      .then((error: any) => {
        loading.stopLoading();
      });
  };

  const cancel = () => {
    setAddNew(false);
    setChapterData(null)
    setIsEdit(false);
  }

  const updateChapter = (chapter: Chapter) => {
    setIsEdit(true);
    setChapterData(chapter);
    setAddNew(true)
  };

  return (
    <>
      <div className="w-full px-4">
        <div className="flex gap-4 py-3 items-center text-gray-500">
          <i>
            <FaRegSquare />
          </i>
          <i>
            <FaRedo />
          </i>
          <i>
            <FaEllipsisV />
          </i>
          <button className="text-custom_orange-700 md:hidden" onClick={() => setAddNew(true)}><FaPlus /></button>
        </div>
        <div className="flex flex-col-reverse justify-between  w-full gap-4 md:flex-row">
          <div className="flex flex-col gap-2 md:w-2/3 ">
          <div className="flex flex-wrap gap-4 relative">
            <Loading {...loading} />
            {chapters.map((chapter) => (
              <ChapterDetail
                key={chapter.id}
                chapter={chapter}
                addTab={addTab}
                updateChapter={updateChapter}
                deleteChapter={deleteChapter}
              />
            ))}
            </div>
            <Pagination {...paginator} className="full"  />
          </div>
          
          <div className="w-full md:w-1/3 hidden md:block">
            <ChapterAdd
              course={params?.id! as string}
              reload={searchChapters}
              isEdit={isEdit}
              cancel={cancel}
              chapterData={chapterData}
            />
          </div>
        </div>
      </div>

      <Dialog open={addNew && (IsWindowUndefined() && window?.innerWidth < 768)} onCancel={cancel} footer={[]} >
          <ChapterAdd
              course={params?.id as string}
              reload={searchChapters}
              isEdit={isEdit}
              cancel={cancel}
              chapterData={chapterData}
            />
        </Dialog>
    </>
  );
}

export default ChapterList;
