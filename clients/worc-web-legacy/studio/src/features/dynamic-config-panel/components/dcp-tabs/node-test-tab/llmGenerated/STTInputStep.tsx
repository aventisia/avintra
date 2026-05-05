import { STTInputMode } from "@/features/dynamic-config-panel/dtos/stt-model-dto";

import { Textarea } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { FileMusicIcon } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

import AudioPlayer from "./AudioPlayer";

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
  onNext: (input: STTInputValue) => void;
}

/**
 * Step 1 for STT test tab.
 *
 * Three mutually-exclusive input modes matching STTProviderRequest.input:
 *   • file  → browser File, converted to Data URL at execution time
 *   • url   → direct HttpUrl string
 *   • text  → plain string (for providers that accept raw text)
 *
 * The file mode shows STTFilePreview which includes an in-line audio player
 * so the user can verify they've selected the right file before continuing.
 */
const STTInputStep = ({ onNext }: STTInputStepProps) => {
  const [mode] = useState<STTInputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  /* react-dropzone — accept audio only for the file tab */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) setFile(accepted[0]);
    },
  });

  const isNextDisabled =
    (mode === "file" && !file) ||
    (mode === "url" && !url.trim()) ||
    (mode === "text" && !text.trim());

  const handleNext = () => {
    onNext({
      mode,
      file: file ?? undefined,
      url: url.trim() || undefined,
      text: text.trim() || undefined,
      // Carry the MIME type so ExecuteButton can forward it as audio_format
      audio_format: file?.type || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── Mode switcher ── */}
      {/* <div className="flex gap-2 border-b pb-3">
        {(["file", "url", "text"] as const).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setMode(m)}
            className="capitalize"
          >
            {m === "file" ? "Upload file" : m === "url" ? "Audio URL" : "Text"}
          </Button>
        ))}
      </div> */}

      {/* ── Input area ── */}
      <div className="min-h-[160px]">
        {/* FILE MODE */}
        {mode === "file" && (
          <div className="space-y-3">
            {!file ? (
              /* Drop zone — shown when no file is selected */
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
                    <span className="text-sm text-primary">
                      Drop files here...
                    </span>
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
                        MP3 · WAV · M4A · OGG · FLAC · WebM
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /*
               * File preview — once a file is picked.
               * STTFilePreview handles the object URL lifecycle and renders
               * a native <audio> player for preview before submission.
               */
              <AudioPlayer src={file} onRemove={() => setFile(null)} />
            )}
          </div>
        )}

        {/* URL MODE */}
        {mode === "url" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Audio URL
            </label>
            <input
              type="url"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="https://example.com/audio.wav"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Must be a publicly accessible audio URL (passed as HttpUrl to BE).
            </p>
          </div>
        )}

        {/* TEXT MODE */}
        {mode === "text" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Text input
            </label>
            <Textarea
              placeholder="Enter text to process…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              For providers that accept raw text as the input field.
            </p>
          </div>
        )}
      </div>

      {/* ── Continue action ── */}
      <div className="flex justify-end pt-2">
        <Button
          size="sm"
          type="button"
          disabled={isNextDisabled}
          onClick={handleNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default STTInputStep;
