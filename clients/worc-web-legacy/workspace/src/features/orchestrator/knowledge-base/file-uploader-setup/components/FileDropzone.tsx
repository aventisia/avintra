// import { cn } from "@aventisia/ui/lib";
// import { CloudUploadIcon } from "lucide-react";
// import { useCallback } from "react";
// import { useDropzone } from "react-dropzone";
// import { FileUploadDto } from "../dtos/file-upload-dto";
// import { useFileUpload } from "../hooks/useFileUpload";
// import { FileState } from "../stores/file-uploader-store";
// interface Props {
//   addFile: (file: FileState) => void;
//   addFileToUpload: (file: FileUploadDto) => void;
//   updateProgress: (name: string, progress: number) => void;
//   clearFiles: () => void;
//   isPublic?: boolean;
// }
// const FileDropzone = ({
//   addFile,
//   addFileToUpload,
//   updateProgress,
//   clearFiles,
//   isPublic,
// }: Props) => {
//   const { mutate: uploadFile, currentController } = useFileUpload({
//     addFileToUpload,
//     updateProgress,
//     clearFiles,
//     isPublic,
//   });
//   const onDrop = useCallback(
//     (acceptedFiles: File[]) => {
//       acceptedFiles.forEach((file) => {
//         addFile({
//           name: file.name,
//           size: file.size,
//           progress: 0,
//           currentController,
//           type: file.type,
//         });
//         uploadFile(file);
//       });
//     },
//     [addFile, uploadFile, currentController],
//   );
//   const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
//     onDrop,
//     noClick: true,
//   });
//   return (
//     <div
//       {...getRootProps()}
//       className={cn(
//         "flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer bg-primary-foreground w-full min-h-[30vh]",
//         isDragActive ? "border-primary " : "border-gray-300",
//       )}
//       onClick={open}
//     >
//       <input {...getInputProps()} />
//       <CloudUploadIcon size={64} className="text-muted-foreground opacity-40" />
//       <div className="mt-4 text-sm text-center">
//         {isDragActive ? (
//           "Drop the files here..."
//         ) : (
//           <div className="flex flex-col justify-center gap-4">
//             <div>
//               <p className="font-medium">
//                 {" "}
//                 Drag & drop or{" "}
//                 <span className="underline text-primary">Browse files</span>
//               </p>
//             </div>
//             <p className="text-muted-foreground">
//               Documents, audio, and images <br /> (
//               {/* Document formats (prettier-ignore) */}
//               <span title="Portable Document Format">pdf</span>,{" "}
//               <span title="Microsoft Word Document">docx</span>,{" "}
//               <span title="Microsoft Excel Spreadsheet">xlsx</span>,{" "}
//               <span title="Comma-Separated Values">csv</span>,{" "}
//               <span title="Rich Text Format">rtf</span>,{" "}
//               <span title="OpenDocument Text">odt</span>,{" "}
//               <span title="Markdown">md</span>,{" "}
//               <span title="Plain Text">txt</span>,
//               {/* Audio formats (prettier-ignore) */}
//               <span title="MP3 Audio">mp3</span>,{" "}
//               <span title="Advanced Audio Coding">aac</span>,{" "}
//               <span title="WAV Audio">wav</span>,{" "}
//               <span title="Ogg Vorbis Audio">ogg</span>,{" "}
//               <span title="Ogg Vorbis Audio">ogg</span>,{" "}
//               <span title="Opus Audio">opus</span>,
//               {/* Image formats (prettier-ignore) */}
//               <span title="JPEG Image">jpg</span>,{" "}
//               <span title="JPEG Image">jpeg</span>,{" "}
//               <span title="Portable Network Graphics">png</span>,{" "}
//               <span title="Bitmap Image">bmp</span>,{" "}
//               <span title="Tagged Image File Format">tiff</span>,{" "}
//               <span title="Tagged Image File Format">tif</span>)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default FileDropzone;
import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { CloudUploadIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { FileState } from "../stores/file-uploader-store";

interface Props {
  addFile: (file: FileState) => void;
}

const FileDropzone = ({ addFile }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile({
          id: crypto.randomUUID(), // Unique ID for list rendering & tracking
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "staged",
          file: file, // Store actual file object
        });
      });
    },
    [addFile],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer bg-white w-full min-h-[30vh]",
       isDragActive ? "border-primary " : "border-gray-300",
       )}
      onClick={open}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon size={56} className="text-gray-400 opacity-60 mb-4" />
      <div className="text-sm text-center">
        {isDragActive ? (
          <p className="font-medium text-primary">Drop the files here...</p>
        ) : (
          <div className="flex flex-col justify-center gap-3">
            <p className="text-sm font-medium ">
              Drag & drop or{" "}
              <span className={cn(buttonVariants({ variant: "link" }))}>
                Browse file
              </span>
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Documents, Audio, Text (jpg, jpeg, png, doc, docx, pdf, txt, mp4,
              mpeg, webm, mp3, wav)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;
