import { AttachmentPrimitive, useAui, useAuiState } from "@assistant-ui/react";
import { cn } from "@avplatform/ui/lib";
import { FilePdfIcon, FileTextIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const useObjectUrl = (file: File | undefined) => {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return file ? url : undefined;
};

const useImageSrc = () => {
  const file = useAuiState((s) => (s.attachment.type === "image" ? s.attachment.file : undefined));
  const dataUrl = useAuiState((s) => {
    const part = s.attachment.content?.find((content) => content.type === "image");
    return part?.type === "image" ? part.image : undefined;
  });
  return useObjectUrl(file) ?? dataUrl;
};

const fileTypeLabel = (name: string) => name.split(".").at(-1)?.toUpperCase() ?? "File";

/** One attached file as a thumbnail or file chip, removable while it is still in the composer. */
export const ChatAttachment = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";
  const name = useAuiState((s) => s.attachment.name);
  const isImage = useAuiState((s) => s.attachment.type === "image");
  const isPdf = useAuiState((s) => s.attachment.contentType === "application/pdf");
  const src = useImageSrc();

  return (
    <AttachmentPrimitive.Root className="relative duration-200 animate-in fade-in zoom-in-95 motion-reduce:animate-none">
      {isImage ? (
        <div className="size-14 overflow-hidden rounded-xl border border-line bg-sunken">
          {src && <img src={src} alt={name} className="size-full object-cover" />}
        </div>
      ) : (
        <div className="flex h-14 max-w-60 items-center gap-2.5 rounded-xl border border-line bg-surface py-2 pl-2 pr-3.5 dark:bg-fill">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
              isPdf ? "bg-bad/10 text-bad" : "bg-primary/10 text-primary-text",
            )}
          >
            {isPdf ? <FilePdfIcon /> : <FileTextIcon />}
          </span>
          <span className="min-w-0 leading-5">
            <span className="block truncate text-sm font-medium text-ink">{name}</span>
            <span className="block text-xs text-muted-foreground">{fileTypeLabel(name)}</span>
          </span>
        </div>
      )}
      {isComposer && (
        <AttachmentPrimitive.Remove
          aria-label={`Remove ${name}`}
          className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full border border-line bg-surface text-ink-2 shadow-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:bg-fill"
        >
          <XIcon weight="bold" className="size-3" />
        </AttachmentPrimitive.Remove>
      )}
    </AttachmentPrimitive.Root>
  );
};
