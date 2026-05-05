// import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import {
  CheckCircle2,
  CloudUploadIcon,
  File as FileIcon,
  FileImage,
  FileText,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadStepProps {
  onNext: (files: File[]) => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns an icon component and accent colour based on MIME type. */
function getFileVisuals(file: File): {
  Icon: React.ElementType;
  colour: string;
} {
  if (file.type.startsWith("image/"))
    return { Icon: FileImage, colour: "text-muted-foreground" };
  if (file.type === "application/pdf")
    return { Icon: FileText, colour: "text-muted-foreground" };
  return { Icon: FileIcon, colour: "text-muted-foreground" };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── component ──────────────────────────────────────────────────────────────

const FileUploadStep = ({ onNext }: FileUploadStepProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // No MIME restriction — inferencing models accept any file type
    onDrop: (accepted) => {
      setFiles((prev) => {
        // Deduplicate by name so re-dropping the same file is safe
        const existing = new Set(prev.map((f) => f.name));
        return [...prev, ...accepted.filter((f) => !existing.has(f.name))];
      });
    },
  });

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const hasFiles = files.length > 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Reference files</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Attach images, PDFs, or documents for the model to reference.
          </p>
        </div>
        {/* Optional badge — makes it crystal-clear this step can be skipped */}
        {/* <Badge variant="" className="shrink-0 text-xs font-normal">
          Optional
        </Badge> */}
      </div>

      {/* ── Drop zone ── */}
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
              <CloudUploadIcon className="text-muted-foreground size-8 stroke-[1.4] opacity-50" />
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
                Supported formats: PDF, DOCX, TXT
              </span>
            </>
          )}
        </div>
      </div>
      {/* ── File list ── */}
      {hasFiles && (
        <div className="flex flex-col gap-1.5">
          {/* Summary row */}
          <div className="mb-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            {files.length} file{files.length > 1 ? "s" : ""} ready
          </div>

          {/* Scrollable list capped at ~3 visible rows */}
          <div className="max-h-[144px] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {files.map((file, idx) => {
                const { Icon, colour } = getFileVisuals(file);
                return (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-2.5 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${colour}`} />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        // Prevent click from bubbling up to the drop zone
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="ml-1 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {hasFiles && (
          // Clear all shortcut — handy when user accidentally added wrong files
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="text-xs text-muted-foreground"
            onClick={() => setFiles([])}
          >
            Clear all
          </Button>
        )}
        <Button size="sm" type="button" onClick={() => onNext(files)}>
          {hasFiles
            ? `Continue with ${files.length} file${files.length > 1 ? "s" : ""}`
            : "Skip & Proceed"}
        </Button>
      </div>
    </div>
  );
};

export default FileUploadStep;
