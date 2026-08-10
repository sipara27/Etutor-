import useApi from "../../../utils/api";
import { AvailablityTime } from "../../../types/AvailablityItem"
import { FetchData } from "../../../types/FetchData";
import { TableSearchModel } from "../../customs/pagination/usePagination";

interface AvailablityTimeSearchModel extends TableSearchModel {
  position?: null | string
  isHome?: boolean
  user?:string
}

const useAvailablityTimeService = () => {
  const { appApi } = useApi();

  const getAvailablityTime = (id: string) => {
    const response = appApi.get<AvailablityTime>(`tutor/availabilty_times/${id}/`);
    return response;
  };
 
  const getAvailablityTimes = (data:AvailablityTimeSearchModel) => {
    const response = appApi.get<FetchData<AvailablityTime>>(`tutor/availabilty_times/`, {
      params: {
        ...data
      }
    });
    return response;
  };
  const addAvailablityTime = (data: AvailablityTime) => {
    const response = appApi.post<AvailablityTime>("tutor/availabilty_times/", data);
    return response;
  };
  const editAvailablityTime = (data: AvailablityTime) => {
    const response = appApi.patch<AvailablityTime>(`tutor/availabilty_times/${data.id}/`, data);
    return response;
  };

  const deleteAvailablityTime = (id: string) => {
    const response = appApi.delete<AvailablityTime>(`tutor/availabilty_times/${id}/`);
    return response;
  };

  return {getAvailablityTimes,editAvailablityTime,addAvailablityTime, getAvailablityTime,deleteAvailablityTime }
};

export default useAvailablityTimeService
