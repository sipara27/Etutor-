import HeroSection from "@/components/home/Herosection";
import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import {Image} from "antd";
import { Suspense } from "react";
import Loading from "./loading";

export default function Home() {
  return (
    <>
      <Header className="bg-custom_orange-100" title="Home" underlined="HomePage" activeTab="courses" />
      <div className="min-h-[600px]">
      <HeroSection />
      </div>
      <Footer /> 
    </>
  );
}
