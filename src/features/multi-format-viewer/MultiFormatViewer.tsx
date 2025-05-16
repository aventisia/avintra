import { useShallow } from "zustand/react/shallow";

import AudioTranscriptionPlayer from "../audio-transcription-player/components/AudioTranscriptionPlayer";
import ImageViewer from "../image-viewer/components/ImageViewer";
import { PdfPreviewer } from "../pdf-previewer/components/PdfPreviewer";
import { useFileListStore } from "./store/file-list-store";

const MultiFormatViewer = () => {
  const { selectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
    })),
  );

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
