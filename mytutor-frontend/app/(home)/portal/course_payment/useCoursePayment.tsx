
import useApi from "@/utils/api";
import { FetchedApi } from "@/utils/common_models/commons.model";
import { CoursePaymentType, CoursePaymentTypeSearchModel } from "./CoursePayment.model";

const useCoursePaymentService = () => {
    const { appApi } = useApi();

    const getCoursePayment = (id: string) => {
        const response = appApi.get<CoursePaymentType>(`finance/course_payment/${id}`);
        return response;
    };

    const addCoursePayment = (coursepayment: CoursePaymentType) => {
        const response = appApi.post<CoursePaymentType>("finance/course_payment/", coursepayment);
        return response;
    };

    const updateCoursePayment = (id: string, coursepayment: CoursePaymentType) => {
        const response = appApi.put<CoursePaymentType>(`finance/course_payment/${id}`, coursepayment);
        return response;
    };

    const coursepaymentDetailDo = (id: string, method: string, payload: any) => {
        const response = appApi.patch<FetchedApi<CoursePaymentType>>(`finance/course_payment/${id}/?method=${method}`, payload);
        return response;
    };

    const getCoursePayments = async (filteredData?: CoursePaymentTypeSearchModel) => {
        console.log(filteredData)
        const response = await appApi.get<FetchedApi<CoursePaymentType>>("finance/course_payment/", {
            params: {
                ...filteredData
            },
        });
        return response.data;
    };
    

    const deleteCoursePayment = (id: string) => {
        const response = appApi.delete<CoursePaymentType>(`finance/course_payment/${id}`);
        return response;
    };

    return {
        getCoursePayment,
        getCoursePayments,
        addCoursePayment,
        deleteCoursePayment,
        updateCoursePayment,
        coursepaymentDetailDo,
    };
};

export default useCoursePaymentService;
