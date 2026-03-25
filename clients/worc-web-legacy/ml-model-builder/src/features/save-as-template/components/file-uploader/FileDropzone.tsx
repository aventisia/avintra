import { Button } from "@aventisia/ui/buttons";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { FileUploadDto } from "../../dtos/file-upload-dto";
import { useFileUpload } from "../../hooks/useFileUpload";
import { FileState } from "../../stores/file-uploader-store";

interface Props {
  addFile: (file: FileState) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
  clearFiles: () => void;
  isPublic?: boolean;
}

const FileDropzone = ({
  addFile,
  addFileToUpload,
  updateProgress,
  clearFiles,
  isPublic,
}: Props) => {
  const { mutate: uploadFile, currentController } = useFileUpload({
    addFileToUpload,
    updateProgress,
    clearFiles,
    isPublic,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile({
          name: file.name,
          size: file.size,
          progress: 0,
          currentController,
          type: file.type,
        });
        uploadFile(file);
      });
    },
    [addFile, uploadFile, currentController],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,

    noClick: true,
  });

  return (
    <div {...getRootProps()} className="flex items-center">
      <input {...getInputProps()} />
      <Button onClick={open} variant="link" size="xs" type="button">
        Browse files
      </Button>
    </div>
  );
};

export default FileDropzone;
