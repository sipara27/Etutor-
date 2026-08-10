import { ContentType } from "../../../../types/Enums";
import { RcFile } from "antd/es/upload";
import useApi from "../../../../utils/api";

export class FileType {
  name?: string;
  uid?: string;
  progress?: number;
  estimate?: number;
}
export const getTimeString = (timeInSecond: any) => {
    const hours = Math.floor(timeInSecond / 3600);
    const minutes = Math.floor(timeInSecond / 60 - hours * 60);
    const seconds = Math.floor(timeInSecond - minutes * 60 - hours * 60);
    let timeString = `${seconds} sec`;
    if (minutes) {
      timeString = `${minutes} min ${timeString}`;
    }
    if (hours) {
      timeString = `${hours} hr ${timeString}`;
    }
    return timeString;
  };

  export function areAllObjectValuesUndefined<T extends object>(obj: T): boolean {
    // Use Object.keys for type safety and potential performance benefits
    const keys = Object.keys(obj) as (keyof T)[]; // Type assertion for clarity

    for (const key of keys) {
      if (obj[key] !== undefined) {
        return false; // If any property is not undefined, return false
      }
    }
    // If the loop completes without finding any non-undefined values, return true
    return true;
  }

  
export const useFileApi = () => {
  const { commonApi } = useApi();

  const addFile = (
    file: RcFile,
    setFileId: any,
    formData: FormData,
    getFileObject: any,
    states: any,
    file_type?: number
  ) => {
    let { setFiles, setFileValue, setImageUrl } = states;

    commonApi
      .post("file/", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          setFiles((pre: FileType) => {
            return {
              ...pre,
              [file.uid]: getFileObject(event?.progress, event.estimated),
            } as FileType;
          });
        },
      })
      .then((result: any) => {
        setFileValue(result.data.id);
        setFileId(result.data.id);
        if (file_type === ContentType.IMAGE) {
          setImageUrl(result.data.url);
        }
      })
      .catch((err) => {
        console.error("Error :", err);
      });
  };

  const updateFile = (
    file: RcFile,
    formData: FormData,
    getFileObject: any,
    states: any,
    id: any
  ) => {
    let { setFiles, setFileValue } = states;

    commonApi
      .patch(`file/${id}`, formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          setFiles((pre: FileType) => {
            return {
              ...pre,
              [file.uid]: getFileObject(event?.progress, event.estimated),
            } as FileType;
          });
        },
      })
      .then((result: any) => {
        setFileValue(result.data.id);
      })
      .catch((err) => {
        console.error("Error :", err);
      });
  };

  const deleteFile = (
    id: string,
    setFiles: any,
    setFileValue: any,
    setImageUrl?: any
  ) => {
    commonApi
      .delete(`file/${id}`)
      .then((result: any) => {
        setFileValue("");
        setFiles(new FileType());
        setImageUrl("");
      })
      .catch((err) => {
        console.error("Error :", err);
      });
  };

  return {
    addFile,
    updateFile,
    deleteFile,
  };
};
