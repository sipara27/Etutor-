import InstructorRegister from "@/component/course/InstructorRegister";
import { UserType } from "@/types/Enums";

const TurorRegisterPage = () =>{
    return (
        <InstructorRegister user_type={UserType.TUTOR} />
    )
}

export default TurorRegisterPage;