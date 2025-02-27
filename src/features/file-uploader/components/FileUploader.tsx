import FileDropzone from "./FileDropzone";
import FileUploadList from "./FileUploadList";

const FileUploader = () => {
  return (
    <div className="flex gap-12 rounded-lg border bg-white p-12 shadow">
      <FileDropzone />
      <FileUploadList />
    </div>
  );
};

export default FileUploader;
