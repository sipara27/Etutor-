import { ETutorContract } from "./ETutorContractItem";
import { User } from "./UserItem";

export interface AvailablityTime {
    id: string,
    user: string | User,
    tutor: string | User,
    tutor_contract:string | ETutorContract
    start_time: string | Date,
    end_time: string |Date,
    day: number,
    status:string | number,
   
}

export interface PartialAvailablityTime extends Partial<AvailablityTime>{
	
}








