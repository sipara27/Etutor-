import { FetchedApi } from '../../../types/FetchedApi';
import useApi from '../../../utils/api';
import { TableSearchModel } from '../../customs/pagination/usePagination';

export interface EducationLevel {
    id:string;
  
    educationlevel_name: string;
    description: string;
   
}

export interface EducationLevelTableSearchModel extends TableSearchModel {

}
 
export const useEducationLevelService = () => {
    const {commonApi} = useApi()

 const addEducationLevel = (educationlevel: EducationLevel) => {
    const response = commonApi.post<EducationLevel>(
        'education-level/', educationlevel
    );
    return response;
};

const getEducationLevel = (id: string) => {
  const response = commonApi.get<EducationLevel>(`education-level/${id}/`);
  return response;
};

const updateEducationLevel = (id: string, educationlevel: EducationLevel) => {
  const response = commonApi.patch<EducationLevel>(`education-level/${id}/`, educationlevel);
  return response;
};

 const getEducationLevels = (filterdata?: EducationLevelTableSearchModel) => {
    const response = commonApi.get<FetchedApi<EducationLevel>>(
        'education-level/', {params:{
          ...filterdata
        }}
    );
    return response;
};

const deleteEducationLevel = (id: string) => {
  const response = commonApi.delete<EducationLevel>(`education-level/${id}/`);
  return response;
};


return { getEducationLevels, deleteEducationLevel, getEducationLevel, addEducationLevel, updateEducationLevel}
}

export default useEducationLevelService
