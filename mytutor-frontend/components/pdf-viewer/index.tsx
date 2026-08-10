"use client";
import { corsUrl } from "@/utils/api";
import { SpecialZoomLevel, Viewer, ViewMode, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { useEffect } from "react";

interface PdfViewProps {
  url: string;
}

const PdfViewer = ({ url }: PdfViewProps) => {
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;;
  const handleKeyDown = (event:any) => {
     if (event.key === 'PrintScreen') {
      event.preventDefault();
    }

     if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
    }
  }; 

  return (
    <div className="h-screen w-full relative " onKeyUp={(e)=>{handleKeyDown(e)}}>
      <Worker workerUrl="/pdf.worker.min.js">
        <Toolbar >
          {({ ZoomIn, ZoomOut, GoToPreviousPage, GoToNextPage, EnterFullScreen, CurrentPageLabel, NumberOfPages }) => (
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-4">
                <ZoomIn />
                <ZoomOut />
                <GoToPreviousPage />
                <GoToNextPage />
                <EnterFullScreen />
              </div>
              <div>
                <CurrentPageLabel /> of <NumberOfPages /></div>
            </div>
          )}

        </Toolbar>
           <Viewer
            fileUrl={`${corsUrl}${url}`}
            plugins={[toolbarPluginInstance]}
            defaultScale={SpecialZoomLevel.PageFit}
            viewMode={ViewMode.SinglePage}          
          />
      </Worker>
    </div>
  );
};


export default PdfViewer