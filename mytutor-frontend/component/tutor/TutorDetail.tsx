import { useEffect } from "react"
import Footer from "@/components/layout/footer/Footer"
import TutorInfoDetail from "@/components/tutors/tutor/TutorInfoDetail"
import Header from "@/components/layout/header/Header"
import { IsWindowUndefined } from "@/utils/func_utils"
 

const TutorDetail = () => {
    useEffect(() => IsWindowUndefined() ? window?.scrollTo(0, 0):undefined, [])
    return <>
        <Header />
        <TutorInfoDetail />
        <Footer />
    </>
}

export default TutorDetail