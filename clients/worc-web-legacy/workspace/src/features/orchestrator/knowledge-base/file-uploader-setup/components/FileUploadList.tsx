// // import { Progress } from "@/features/tenant/shared/Progress";
// import { Button } from "@aventisia/ui/buttons";
// import { TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
// import { FileTextIcon } from "lucide-react";
// import { useShallow } from "zustand/react/shallow";
// import { FileState, useFileStore } from "../stores/file-uploader-store";
// import { formatFileSize } from "../utils";
// import FileDropzone from "./FileDropzone";
// const FileUploadList = ({ isPublic }: { isPublic?: boolean }) => {
//   const {
//     files,
//     filesToUpload,
//     addFile,
//     addFileToUpload,
//     updateProgress,
//     removeFile,
//     clearFiles,
//     addFileToDelete,
//   } = useFileStore(
//     useShallow((state) => ({
//       files: state.files,
//       filesToUpload: state.filesToUpload,
//       addFile: state.addFile,
//       addFileToUpload: state.addFileToUpload,
//       addFileToDelete: state.addFileToDelete,
//       updateProgress: state.updateProgress,
//       removeFile: state.removeFile,
//       clearFiles: state.clearFiles,
//     })),
//   );
//   const cancelUpload = (controller?: AbortController | null) => {
//     controller?.abort();
//   };
//   // const removeAll = () => {
//   //   filesToUpload.forEach((file) => {
//   //     addFileToDelete(file); // server delete
//   //   });
//   // };
//   const handleDelete = (name: string) => {
//     console.log(name);
//     const uploadedFile = filesToUpload.find((f) => f.name === name);
//     console.log(uploadedFile);
//     if (uploadedFile) addFileToDelete(uploadedFile);
//   };
//   const handleDeleteBefore = (file: FileState) => {
//     cancelUpload(file.currentController);
//     removeFile(file.name);
//   };
//   const getProgressForFile = (name: string): FileState | undefined =>
//     files.find((f) => f.name === name);
//   return (
//     <div className="h-full">
//       <FileDropzone
//         addFile={addFile}
//         addFileToUpload={addFileToUpload}
//         updateProgress={updateProgress}
//         clearFiles={clearFiles}
//         isPublic={isPublic}
//       />
//       {(filesToUpload.length > 0 || files.length > 0) && (
//         <div className="flex flex-col gap-2 border-t pt-2 ">
//           {[...filesToUpload, ...files].map((file, idx) => {
//             const fileState = getProgressForFile(file.name);
//             const isUploading = fileState && fileState.progress < 100;
//             const progress = fileState?.progress ?? 100;
//             return (
//               <div
//                 key={`${file.name}-${idx}`}
//                 className="rounded-lg bg-indigo-100 p-2"
//               >
//                 <div className="flex items-center justify-between gap-2">
//                   <div className="bg-white rounded-full flex items-center justify-center h-7 w-7">
//                     <FileTextIcon className="h-5 w-5 text-primary" />
//                   </div>
//                   <div className="flex flex-1 flex-col">
//                     <p className="text-2xs font-medium">{file.name}</p>
//                     <p className="text-2xs text-muted-foreground">
//                       {isUploading
//                         ? `Uploading... ${progress}%`
//                         : `${progress}% · ${formatFileSize(file.size)}`}
//                     </p>
//                   </div>
//                   <Button
//                     type="button"
//                     variant="caution"
//                     size="icon7"
//                     onClick={() =>
//                       isUploading && fileState
//                         ? handleDeleteBefore(fileState)
//                         : handleDelete(file.name)
//                     }
//                   >
//                     {isUploading ? (
//                       <XCircleIcon className="h-5 w-5" />
//                     ) : (
//                       <TrashIcon className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//                 {/* <Progress
//                   value={progress}
//                   className={progress === 100 ? "bg-green-500" : "bg-primary"}
//                 /> */}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };
// export default FileUploadList;
import { useKBFilesDialogStore } from "@/features/orchestrator/knowledge-base/stores/kb-files-upload-dialog-store";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ScrollArea } from "@aventisia/ui/scroll";
import { FileTextIcon, XIcon } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import FileUploadInfo from "../../components/kb-details/FileUploadInfo";
import { useFileUpload } from "../hooks/useFileUpload";
import { useFileStore } from "../stores/file-uploader-store";
import { formatFileSize } from "../utils";
import FileDropzone from "./FileDropzone";

const FileUploadList = ({ isPublic }: { isPublic?: boolean }) => {
  const { files, addFile, updateFile, removeFile, addFileToUpload, clearAll } =
    useFileStore(
      useShallow((state) => ({
        files: state.files,
        addFile: state.addFile,
        updateFile: state.updateFile,
        removeFile: state.removeFile,
        addFileToUpload: state.addFileToUpload,
        clearAll: state.clearAll,
      })),
    );
  const { setShowDialog } = useKBFilesDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
    })),
  );

  const { mutateAsync: uploadFiles, isPending } = useFileUpload({
    addFileToUpload,
    updateFile,
    isPublic,
  });

  const handleUploadAll = async () => {
    const stagedFiles = files.filter(
      (f) => f.status === "staged" || f.status === "error",
    );
    if (stagedFiles.length === 0) return;

    try {
      await uploadFiles(stagedFiles);
      // Optional: you could call a clearFiles() or trigger a success notification here
    } catch (error) {
      console.error("Some files failed to upload", error);
    }
  };

  const handleRemove = (id: string, controller?: AbortController | null) => {
    if (controller) controller.abort();
    removeFile(id);
  };
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);
  return (
    <div className="flex  h-[calc(85vh-3.5rem)] flex-col gap-3 p-4 justify-between">
      <FileDropzone addFile={addFile} />
      {files.length > 0 && (
        <div className="flex h-full flex-col gap-2 ">
          <h4 className="text-sm font-medium text-slate-700">Selected Files</h4>
          <ScrollArea
            className={cn("h-full px-2.5", files.length > 2 && "h-32")}
          >
            <div className="flex flex-col gap-2">
              {files.map((file) => {
                const isUploading = file.status === "uploading";
                const isSuccess = file.status === "success";
                const isError = file.status === "error";

                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl bg-muted p-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded-full flex items-center justify-center h-10 w-10 shadow-sm border border-indigo-100">
                        <FileTextIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium ">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isUploading && `Uploading... ${file.progress}%`}
                          {isSuccess && "Uploaded successfully"}
                          {isError && (
                            <span className="text-red-500">Upload failed</span>
                          )}
                          {file.status === "staged" &&
                            formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    {!isSuccess && (
                      <Button
                        type="button"
                        onClick={() =>
                          handleRemove(file.id, file.currentController)
                        }
                        variant={"ghost"}
                        size={"icon7"}
                        aria-label="Remove file"
                        className="hover:bg-indigo-100"
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
      <FileUploadInfo />
      {/* Upload Action Footer matching Figma */}
      <div className=" flex justify-end gap-3 mb-1 pt-4 border-t ">
        <Button
          variant="outline"
          onClick={() => {
            setShowDialog(false);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUploadAll}
          disabled={
            isPending || files.filter((f) => f.status === "staged").length === 0
          }
        >
          {isPending ? "Uploading..." : "Upload Files"}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadList;
