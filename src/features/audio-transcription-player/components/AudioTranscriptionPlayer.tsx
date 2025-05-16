import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { FileViewerDto } from "@/features/multi-format-viewer/dtos/file-list-dtos";
import { useDownloadFile } from "@/features/multi-format-viewer/hooks/useDownloadFile";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import PaginatedSelect from "@/features/pdf-previewer/components/PaginationSelect";

import { ScrollArea } from "@aventisia/ui/scroll";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useShallow } from "zustand/react/shallow";

import "../styles/audio-player.css";
import AudioLoaderTemplate from "./AudioLoaderTemplate";
import AudioPlaybackSpeedSelect from "./AudioPlaybackSpeedSelect";
import ControlPanel from "./ControlPanel";
import { customAudioPlayerIcons } from "./CustomAudioPlayerIcons";
import TranscriptTimeline from "./TranscriptTimeline";

const AudioTranscriptionPlayer = () => {
  const [playbackRate, setPlaybackRate] = useState<string>("1");
  const playerRef = useRef<AudioPlayer | null>(null);
  const { data: fileList, isLoading } = useFetchUploadedFiles();
  const { selectedFile, setSelectedFile, fileUrl } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      fileUrl: state.fileUrl,
      setSelectedFile: state.setSelectedFile,
    })),
  );
  const { mutate: downloadAudio } = useDownloadFile();
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  // Load initial File
  useEffect(() => {
    if (selectedFile) {
      downloadAudio(selectedFile.path || "");
    }
  }, [selectedFile, downloadAudio, modelId]);

  const handlePdfSelect = (newFile: FileViewerDto) => {
    downloadAudio(newFile.path || "");
    setSelectedFile(newFile);
  };

  const handleSpeedChange = (newRate: string) => {
    const parsedRate = parseFloat(newRate);
    setPlaybackRate(newRate);
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.playbackRate = parsedRate;
    }
  };

  if (isLoading) {
    return <AudioLoaderTemplate />;
  }

  if (!fileList?.data?.length) {
    return <div className="p-4 text-center">Cannot load Audio!!</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border shadow bg-white">
      <ControlPanel />
      <ScrollArea className="h-[calc(100vh-11.2rem)] w-full p-4 bg-accent">
        <AudioPlayer
          ref={playerRef}
          className="shadow-xl rounded-lg mb-10"
          src={fileUrl || ""}
          progressJumpSteps={{ backward: 5000, forward: 5000 }}
          customIcons={{
            ...customAudioPlayerIcons,
          }}
          showFilledVolume={true}
          header={
            <p className="text-left mb-2 mt-0.5 text-md">
              {selectedFile?.name}
            </p>
          }
          customAdditionalControls={[
            <AudioPlaybackSpeedSelect
              value={playbackRate}
              onChange={handleSpeedChange}
            />,
          ]}
        />
        <TranscriptTimeline />
      </ScrollArea>
      <PaginatedSelect
        pdfList={fileList?.data}
        selectedPdf={selectedFile || fileList?.data[0]}
        onPdfSelect={handlePdfSelect}
      />
    </div>
  );
};

export default AudioTranscriptionPlayer;
