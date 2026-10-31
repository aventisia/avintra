import { Button } from "@avplatform/ui/buttons";
import { FileAudio, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface STTFilePreviewProps {
  file: File;
  /** Called when the user wants to remove and re-pick a file. */
  onRemove: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Displays metadata for the selected audio file and provides a native
 * <audio> player for quick preview before submitting.
 *
 * Uses URL.createObjectURL so no base64 encoding happens here — the data URL
 * for the actual STT request is only created when Execute is clicked.
 *
 * NOTE: Within the STT test tab this component has been superseded by the
 * compact variant of AudioPlayer (<AudioPlayer src={file} compact />), which
 * packs everything into a single line and integrates better with the
 * single-screen layout.  STTFilePreview is kept for any other call-sites
 * outside the test tab that may still reference it.
 */
const STTFilePreview = ({ file, onRemove }: STTFilePreviewProps) => {
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    // Create a short-lived object URL for the audio preview element
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    // Revoke on unmount or when a new file is picked — prevents memory leaks
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
      {/* ── File identity row ── */}
      <div className="flex items-center gap-3">
        {/* Icon badge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <FileAudio className="h-5 w-5 text-primary" />
        </div>

        {/* Name + size */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)} · {file.type || "audio"}
          </p>
        </div>

        {/* Remove button — lets user go back and pick a different file */}
        <Button
          size="icon8"
          variant="ghost"
          type="button"
          onClick={onRemove}
          aria-label="Remove file"
          className="shrink-0 text-muted-foreground hover:bg-bad/10 hover:text-bad"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ── Native audio player for pre-submit preview ── */}
      {objectUrl && (
        <audio
          controls
          src={objectUrl}
          // Full width so the timeline scrubber is actually usable
          className="h-9 w-full rounded "
          // Don't auto-play — user explicitly hits play when they want to preview
          preload="metadata"
        />
      )}
    </div>
  );
};

export default STTFilePreview;
