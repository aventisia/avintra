import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { FileMusicIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { STTInputMode } from "@/features/dynamic-config-panel/dtos/stt-model-dto";

import AudioPlayer from "./AudioPlayer";

/**
 * Keep STTInputValue exported — ExecuteButton imports this type to type its
 * sttInput prop, so renaming or moving it would break ExecuteButton.
 */
export interface STTInputValue {
  mode: STTInputMode;
  file?: File;
  url?: string;
  text?: string;
  /** MIME type of the selected file, forwarded to the BE as `audio_format`. */
  audio_format?: string;
  language?: string;
}

interface STTInputStepProps {
  /** The currently selected audio file, or null when nothing is chosen yet. */
  file: File | null;
  /**
   * Called every time the selection changes — either a new File was dropped /
   * chosen, or the user clicked the remove button (passes null).
   *
   * The parent (ModelTestContent) owns the state; this component is fully
   * controlled so that the file picker and the transcript output can live
   * side-by-side on the same screen without a "Continue" step in between.
   */
  onFileChange: (file: File | null) => void;
}

/**
 * Audio file picker for the STT test tab.
 *
 * Deliberately thin — it contains no internal file state and no "Continue"
 * button.  All state lives in ModelTestContent which renders both this
 * component and the transcript output area together in one view.
 *
 * When a file is selected the compact AudioPlayer variant is shown so the
 * user can preview the clip and swap it out, all without leaving the screen.
 */
const STTInputStep = ({ file, onFileChange }: STTInputStepProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) onFileChange(accepted[0]);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {!file ? (
        /* ── Drop zone — shown until the user picks a file ── */
        <div
          {...getRootProps()}
          className={cn(
            "flex items-center h-[10rem] justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary hover:bg-primary/5",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-1">
            {isDragActive ? (
              <span className="text-sm text-primary">Drop files here...</span>
            ) : (
              <>
                <FileMusicIcon className="text-muted-foreground size-8 stroke-[1.4] opacity-50" />
                <span className="text-sm font-medium text-gray-600 block">
                  Drag & Drop or{" "}
                  <Button
                    autoFocus
                    variant="link"
                    type="button"
                    className="text-primary hover:underline"
                  >
                    Choose file
                  </Button>{" "}
                  to upload
                </span>
                <span className="text-2xs text-muted-foreground">
                  Supported formats: MP3, WAV, M4A, WebM
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        /*
         * ── Compact single-line preview once a file is chosen ──
         *
         * AudioPlayer compact mode renders: icon | name + size | play/pause |
         * scrubber | time | remove — all in one row, taking no more vertical
         * space than a list item.
         */
        <AudioPlayer src={file} compact onRemove={() => onFileChange(null)} />
      )}
    </div>
  );
};

export default STTInputStep;
