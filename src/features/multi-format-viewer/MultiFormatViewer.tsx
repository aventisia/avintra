import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import AudioTranscriptionPlayer from "../audio-transcription-player/components/AudioTranscriptionPlayer";
import ImageViewer from "../image-viewer/components/ImageViewer";
import { useFetchModel } from "../label-data/hooks/useFetchModel";
import { PdfPreviewer } from "../pdf-previewer/components/PdfPreviewer";
import { useFileListStore } from "./store/file-list-store";

const MultiFormatViewer = () => {
  const { selectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
    })),
  );
  const { data: modelData, isLoading } = useFetchModel();
  const modelType = modelData?.data.type?.toLowerCase(); // Convert to lowercase for case insensitivity

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
        <div className="col-span-2 overflow-hidden rounded-lg border bg-white shadow"></div>
      );
  }
};

export default MultiFormatViewer;
