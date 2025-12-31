import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import AudioTranscriptionPlayer from "../audio-transcription-player/components/AudioTranscriptionPlayer";
import ImageViewer from "../image-viewer/components/ImageViewer";
import PaginatedSelect from "../pdf-previewer/components/PaginationSelect";
import { PdfPreviewer } from "../pdf-previewer/components/PdfPreviewer";
import { FileViewerDto } from "./dtos/file-list-dtos";
import { useDownloadFile } from "./hooks/useDownloadFile";
import { useFetchUploadedFiles } from "./hooks/useFetchFiles";
import { useFileListStore } from "./store/file-list-store";

const MultiFormatViewer = () => {
  const { selectedFile, setSelectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      setSelectedFile: state.setSelectedFile,
    })),
  );
  const { data: modelData, isLoading } = useFetchProjectMetaData();
  const modelType = modelData?.data.type?.toLowerCase(); // Convert to lowercase for case insensitivity

  // ------------------------- file selection handler -------------------------
  const { data: fileList } = useFetchUploadedFiles();
  const { mutate: downloadFile } = useDownloadFile();

  if (!fileList?.data?.length) {
    return <div className="p-4 text-center">No files available</div>;
  }

  console.log("fileList data:", fileList?.data);

  const handleFileSelect = (newFile: FileViewerDto) => {
    setSelectedFile(newFile);
    downloadFile(newFile.path || "");
  };
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[--icon-color]" />
        <span> Loading...</span>
      </div>
    );
  }

  if (modelType === "aipersona") {
    return null;
  }

  switch (selectedFile && selectedFile.extension?.toUpperCase()) {
    case "JPEG":
    case "JPG":
    case "PNG":
    case "WEBP":
    case "BMP":
    case "TIF":
    case "TIFF":
      return <ImageViewer />;

    case "PDF":
      return <PdfPreviewer />;

    case "MP3":
    case "WAV":
    case "OGG":
    case "OGA":
    case "AAC":
    case "OPUS":
      return <AudioTranscriptionPlayer />;

    default:
      return (
        <div className="h-[calc(100vh-4.55rem)] w-full flex flex-col items-center justify-between text-muted-foreground p-2 overflow-hidden rounded-lg border bg-white shadow">
          <div className="h-full flex items-center">
            Preview not supported for the file format
            <span className="font-semibold ml-1">
              {`.${selectedFile?.extension?.toLowerCase()}`}
            </span>
            .
          </div>
          <PaginatedSelect
            pdfList={fileList?.data}
            selectedPdf={selectedFile || fileList?.data[0]}
            onPdfSelect={handleFileSelect}
          />
        </div>
      );
  }
};

export default MultiFormatViewer;
