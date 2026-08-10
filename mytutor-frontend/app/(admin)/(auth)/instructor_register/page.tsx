import InstructorRegister from "@/component/course/InstructorRegister";
import { UserType } from "@/types/Enums";


const InstructorRegisterPage = () => {
    return (
     <InstructorRegister user_type={UserType.INSTRUCTOR}/>
    )
}

export default InstructorRegisterPage;