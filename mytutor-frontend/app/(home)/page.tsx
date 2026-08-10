import HeroSection from "@/components/home/Herosection";
import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import { Image } from "antd";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import Loading from "../loading";

export default function Home() {

  return (
    <>
        {/* <Suspense fallback={<Loading />}> */}
          <HeroSection />
        {/* </Suspense>   */}
    </>
  );
}
