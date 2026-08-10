import { useEffect, useState } from "react";
import { FileOutlined, InboxOutlined, UserOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import {
  Button,
  Progress,
  Space,
  Typography,
  Upload,
  Image,
  Tooltip,
} from "antd";
import { InputProps } from "../../../../types/InputTypeProp";
import { Controller, FieldValues, Path } from "react-hook-form";
import { ContentType, FileTypes } from "../../../../types/Enums";
import { RcFile } from "antd/es/upload";
import CustomInputError from "../../custom-input-error/CustomInputError";
import { BiTrashAlt } from "react-icons/bi";
import {
  areAllObjectValuesUndefined,
  FileType,
  getTimeString,
  useFileApi,
} from "./useFileApi";
import { FaInfoCircle } from "react-icons/fa";

export const CustomFileUploader = <T extends FieldValues>(
  props: InputProps<T>
) => {
  const {
    fileType = 100,
    getValues,
    label,
    register,
    placeholder,
    setValue,
    setError,
    clearErrors,
    control,
    options,
    error,
    className,
    imagePlaceHolder = null,
    imageUrlValue = "",
  } = props;
  const [files, setFiles] = useState<FileType>(new FileType());
  const fileName = getValues && getValues("file_name" as Path<T>);
  const fileSize = getValues && getValues("file_size" as Path<T>);
  const file_id = getValues && getValues(label);
  const [visible, setVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [fileId, setFileId] = useState("");
  const { addFile, updateFile, deleteFile } = useFileApi();

  const validate = (file: RcFile, fileSize: number) => {
    if (file.size < fileSize) {
      clearErrors?.(label);
      return true;
    } else {
      console.log("File siqqze", label);

      setError?.(label, {
        message: `File size should be less than ${fileSize / (1024 * 1024)}MB`,
      });

      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    setFileValue("");
    setFiles(new FileType());
    setImageUrl("");
  }, [props.clearFileAfterSubmit]);

  useEffect(() => {
    if (imageUrlValue != "") {
      setImageUrl(imageUrlValue);
    }
  }, []);

  // useEffect(() => {
  //   setImageUrl(getValues?.("profile_picture" as Path<T>)?.toString());
  // }, [getValues?.("profile_picture" as Path<T>)]);

  const sizeValidation = (file: RcFile) => {
    if (file) {
      let fileSize = null;
      if (ContentType.VIDEO === fileType) {
        fileSize = 20 * 1024 * 1024;
        return validate(file, fileSize);
      } else if (ContentType.IMAGE === fileType) {
        fileSize = 2 * 1024 * 1024;
        return validate(file, fileSize);
      } else if (ContentType.DOCUMENT === fileType) {
        fileSize = 1 * 1024 * 1024;
        return validate(file, fileSize);
      }
    }
  };

  const setFileValue = (fileId: any) => setValue && setValue(label, fileId);

  const uploadProps: UploadProps = {
    accept: FileTypes[fileType],
    maxCount: 1,
    beforeUpload(file) {
      if (files) {
        setFiles(new FileType());
      }
      return sizeValidation(file) || Upload.LIST_IGNORE;
    },
    customRequest: (options) => {
      const file = options.file as RcFile;

      const formData = new FormData();
      formData.append("url", file as Blob);
      formData.append("file_type", "101");

      const getFileObject = (progress: any, estimated: any) => {
        return {
          name: file.name,
          uid: file.uid,
          progress: progress,
          estimated: estimated || 0,
        };
      };

      if (!(getValues && getValues(label)) && !imageUrlValue) {
        let states = { setFiles, setFileValue, setImageUrl };
        addFile(
          file,
          setFileId,
          formData,
          getFileObject,
          states,
          props.fileType
        );
      } else {
        let states = { setFiles, setFileValue };
        updateFile(file, formData, getFileObject, states, file_id || fileId);
      }
    },
  };

  // Image add
  // 1- select image, add to database, bring file url, open it on the image input field
  // 2- select image,delete previous uploaded image, add current image to database, bring file url, open it on the image input field

  // Image edit
  // 1 - Fetched image url will be displayed on image input field,
  // 2 - select image, add current image to database, bring file url, open it on the image input field,

  const editImageJsx = (
    <Image
      preview={false}
      src={imageUrlValue || imageUrl ||""}
      alt="Image not found"
      className="object-cover max-h-60"
    />
  );

  const addImageJsx = imageUrl ? (
    <Image
      preview={false}
      src={imageUrl}
      alt="Image not found"
      className="object-cover max-h-60"
    />
  ) : (
    imagePlaceHolder || (
      <>
        <p className="self-start font-semibold">{placeholder}</p>
        <p className="ant-upload-drag-icon text-custom_orange-800">
          <UserOutlined color="text-custom_orange-800" />
        </p>
        <p className="ant-upload-text">Browse or drag a picture here</p>
      </>
    )
  );

  const progressBarJsx = !areAllObjectValuesUndefined(files)
    ? Object.values(files!).map((file, index) => {
        return (
          file && (
            <Space
              direction="vertical"
              className="mt-3"
              style={{
                backgroundColor: "rgba(0,0,0,0.03",
                padding: 8,
                borderRadius: 10,
              }}
            >
              <Space className="flex justify-between">
                <div className="flex flex-col">
                  <div className="flex">
                    <p className="w-full m-0 overflow-hidden truncate">
                      {
                        <Tooltip title={(file as RcFile)?.name}>
                          <FileOutlined />
                          File <FaInfoCircle size={18} />
                        </Tooltip>
                      }
                    </p>

                    {file?.estimated ? (
                      <Typography.Text className="w-full" type="secondary">
                        {" "}
                        is being uploaded in {getTimeString(
                          file?.estimated
                        )}{" "}
                        seconds
                      </Typography.Text>
                    ) : (
                      <Typography.Text className="w-full" type="secondary">
                        {" "}
                        is uploaded successfully
                      </Typography.Text>
                    )}
                  </div>
                </div>
                <div className="flex self-end">
                  <BiTrashAlt
                    style={{ color: "red" }}
                    className="hover:cursor-pointer"
                    onClick={() => {
                      deleteFile(
                        (getValues && getValues(label))! || fileId,
                        setFiles,
                        setFileValue,
                        setImageUrl
                      );
                      setFileValue("");
                    }}
                  />
                </div>
              </Space>
              <Progress percent={Math.ceil(file?.progress * 100)} />
            </Space>
          )
        );
      })
    : fileName &&
      fileSize && (
        <Space
          direction="vertical"
          className="mt-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.03",
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Space>
            <FileOutlined />
            <Typography>
              {fileName} {fileSize}
            </Typography>

            <BiTrashAlt
              style={{ color: "red" }}
              className="hover:cursor-pointer"
              onClick={() => {
                deleteFile(
                  (getValues && getValues(label))! || fileId,
                  setFiles,
                  setFileValue
                );
                setFileValue("");
              }}
            />
          </Space>
        </Space>
      );

  return (
    <>
      <Controller
        key={label}
        name={label}
        control={control}
        rules={{
          required: options?.required,
        }}
        render={({ field }) => {
          setFileId(field.value);
          // setValue && setValue(label, field.value);
          return (
            <div
              className={`flex flex-col items-center justify-center h-full gap-y-2 ${className}`}
            >
              {/* {field.value} */}

              <div className="flex flex-col w-full h-full">
                <Upload.Dragger
                  className="h-full"
                  {...uploadProps}
                  showUploadList={false}
                >
                  {props.fileType === ContentType.IMAGE ? (
                    <div className="flex flex-col items-center justify-center">
                      {field.value ? editImageJsx : addImageJsx}
                    </div>
                  ) : (
                    <div>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>

                      <p className="ant-upload-text">
                        {!fileName ? (
                          <>Click or drag file to this area to upload</>
                        ) : (
                          <>Update current file by drag or upload new file</>
                        )}
                      </p>
                      <p className="ant-upload-hint">
                        Strictly prohibited uploading fake data or other banned
                        files.
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
                {progressBarJsx}
              </div>
              {showPreview(props, imageUrl || "", setVisible, visible)}
              {error && <CustomInputError msg={error?.message} />}
            </div>
          );
        }}
      />
    </>
  );
};

export const showPreview = <T extends FieldValues>(
  props: InputProps<T>,
  imageUrl: string,
  setVisible: any,
  visible: boolean
) => {
  const scaleStep = 0.5;
  return (
    <>
      {props.fileType === ContentType.IMAGE && imageUrl && (
        <div>
          <Button type="primary" onClick={() => setVisible(true)}>
            show image preview{" "}
          </Button>
          <Image
            style={{ display: "none" }}
            src={imageUrl}
            alt="image not found"
            preview={{
              visible,
              scaleStep,
              src: imageUrl,
              onVisibleChange: (value) => {
                setVisible(value);
              },
            }}
          />
        </div>
      )}
    </>
  );
};
