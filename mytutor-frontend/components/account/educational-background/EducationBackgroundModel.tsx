import { TableSearchModel } from "../../customs/pagination/usePagination";

export interface EducationalBackground{
	id:string,
	user:string,
	level_of_education: string,
	school_of_education: string,
	document:FileList|string,
	document_url?:string,
	file_name?:string,
	file_size?: number,
	start_date:string,
	year_of_graduation:string|undefined,
	currently_learning:boolean,
	url?:string,
	file_id?:string,
	field_of_study:string,
	level_of_education_name?:string
}

export interface EducationBackgroundFilterModel extends TableSearchModel {
	user_id?:string
}
