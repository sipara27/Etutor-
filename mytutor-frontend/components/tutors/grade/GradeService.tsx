import { FetchedApi } from '../../../types/FetchedApi';
import useApi from '../../../utils/api';
import { TableSearchModel } from '../../customs/pagination/usePagination';

export interface Grade {
    id:string;
  
    grade_name: string;
    description: string;
  
}

export interface GradeTableSearchModel extends TableSearchModel {

}
 
export const useGradeService = () => {
    const {appApi} = useApi()

 const addGrade = (grade: Grade) => {
    const response = appApi.post<Grade>(
        'tutor/grade/', grade
    );
    return response;
};

const getGrade = (id: string) => {
  const response = appApi.get<Grade>(`tutor/grade/${id}/`);
  return response;
};

const updateGrade = (id: string, grade: Grade) => {
  const response = appApi.patch<Grade>(`tutor/grade/${id}/`, grade);
  return response;
};

 const getGrades = (filterdata?: GradeTableSearchModel) => {
    const response = appApi.get<FetchedApi<Grade>>(
        'tutor/grade/', {params:{
          ...filterdata
        }}
    );
    return response;
};

const deleteGrade = (id: string) => {
  const response = appApi.delete<Grade>(`tutor/grade/${id}/`);
  return response;
};


return { getGrades, deleteGrade, getGrade, addGrade, updateGrade}
}

export default useGradeService
