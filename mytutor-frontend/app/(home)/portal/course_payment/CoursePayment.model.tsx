import { CommonType, TableSearchModel } from "@/utils/common_models/commons.model";


export type CoursePaymentType = {
    id: string;
    student: string;
    student_name: string;
    course: string;
    course_name: string;
    payment_type: number;
    status: number;
    total_price: number;
    payment_date: Date | string;
    additional_price: number;
    discount_price: number;
    payment_receipt: string;
    payment_receipt_url: string;
    reference_no: string;
    bank: string;
    bank_name: string;
    bank_account_number:number;
  
  } & CommonType;

  export interface CoursePaymentTypeSearchModel extends TableSearchModel {
    
  }