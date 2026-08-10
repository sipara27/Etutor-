import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Carousel, Image, Modal } from "antd";
import useAdvertService from "./AdvertService";
import { Advert } from "../../../types/AdvertItem";
import useLoading from "../../customs/loading/LoadingHook";
import { IsWindowUndefined } from "@/utils/func_utils";

const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-gray-100" />,
});

interface ExternalProps {
  position: string;
}

const ExternalAdvert = (props: ExternalProps) => {
  const advertservice = useAdvertService();
  const [adverts, setAdverts] = useState<any[]>([]);
  const [activeAdvert, setActiveAdvert] = useState<Advert | null>(null);

  const loading = useLoading();

  useEffect(() => {
    searchAdverts();
  }, []);

  const searchAdverts = () => {
    loading.startLoading();
    advertservice
      .getAdverts({},{ position: props?.position, isHome: true })
      .then(({ data: result }) => {
        if (IsWindowUndefined() && window?.innerWidth > 768) {
          setAdverts(divideArray(result.results));
        } else {
          setAdverts(result.results);
        }

        loading.stopLoading();
      })
      .catch((error) => loading.stopLoading());
  };

  const closeModal = () => setActiveAdvert(null);

  function divideArray(arr: Advert[]) {
    const result = [];
    for (let i = 0; i < arr.length; i += 2) {
      result.push(arr.slice(i, i + 2));
    }
    return result;
  }

  return (
    <>
      <Carousel autoplay style={{ width: "90%" }}>
        {adverts.map((item, index) => (
        <React.Fragment key={Array.isArray(item) ? `group-${index}` : item.id}>
          {Array.isArray(item) && (
            <div className="  flex w-full">
              {item.map((advert: Advert) => (
                <React.Fragment key={advert.id}>
                  {(advert.video_url === null || advert.video_url === "") && (
                    <a
                      className="w-full h-full mr-0 mt-6 md:mr-6 md:mt-0"
                      href={advert.link}
                      target="_blank"
                    >
                      <Image
                        src={advert.image_url.toString()}
                        alt="Image not found"
                        className="max-h-[120px] w-full object-cover cursor-pointer"
                      />
                    </a>
                  )}
                  {advert.video_url != null && advert.video_url != "" && (
                    <>
                      <button
                        type="button"
                        className="w-full h-full mr-0 mt-6 md:mr-6 md:mt-0"
                        onClick={() => setActiveAdvert(advert)}
                      >
                        <Image
                          src={advert.image_url.toString()}
                          alt="Image not found"
                          className="max-h-[120px] w-full object-cover cursor-pointer"
                        />
                      </button>
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {typeof item === "object" && !Array.isArray(item) && (
            <div className="flex  md:hidden">
              {(item.video_url === null || item.video_url === "") && (
                <a className="w-full h-full " href={item.link} target="_blank">
                  <Image
                    src={item.image_url.toString()}
                    alt="Image not found"
                    className="max-h-[120px] w-full object-cover cursor-pointer"
                  />
                </a>
              )}
              {item.video_url != null && item.video_url != "" && (
                <>
                  <button
                    type="button"
                    className="w-full h-full mr-0"
                    onClick={() => setActiveAdvert(item)}
                  >
                    <Image
                      src={item.image_url.toString()}
                      alt="Image not found"
                      className="max-h-[120px] w-full object-cover cursor-pointer"
                    />
                  </button>
                </>
              )}
            </div>
          )}
        </React.Fragment>
        ))}
      </Carousel>
      <Modal
        title={activeAdvert?.company_name}
        open={activeAdvert !== null}
        onOk={closeModal}
        onCancel={closeModal}
        destroyOnClose
      >
        {activeAdvert?.video_url && (
          <ReactPlayer
            url={activeAdvert.video_url.toString()}
            width="100%"
            controls
          />
        )}
        {activeAdvert && (
          <a
            className="text-custom_orange-900"
            href={activeAdvert.link}
            target="_blank"
            rel="noreferrer"
          >
            Go to website
          </a>
        )}
      </Modal>
    </>
  );
};

export default ExternalAdvert;
