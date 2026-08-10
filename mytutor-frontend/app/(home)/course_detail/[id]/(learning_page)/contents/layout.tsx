"use client"
import DashboardHeader from "@/components/commons/dashboard-header/DashboardHeader"

interface EnrolledCourseContentLayoutProps {
  children: React.ReactNode;
}

const EnrolledCourseContentLayout = ({
  children, // will be a page or nested layout
}: EnrolledCourseContentLayoutProps) => {
  
return (
    <>
        <DashboardHeader title='Content' />
        {children}
    </>
    )
}
export default EnrolledCourseContentLayout