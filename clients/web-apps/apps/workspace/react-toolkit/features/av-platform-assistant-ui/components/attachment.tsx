import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import { Avatar, AvatarFallback, AvatarImage } from "@avplatform/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { FileTextIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { type FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { TooltipIconButton } from "./tooltip-icon-button";

const WORKSPACE_CHAT_MAX_ATTACHMENT_COUNT = 3;

const WORKSPACE_CHAT_MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const WORKSPACE_CHAT_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const WORKSPACE_CHAT_ALLOWED_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "pdf",
  "txt",
  "md",
  "csv",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
];

const WORKSPACE_CHAT_UPLOAD_ACCEPT = [
  ...WORKSPACE_CHAT_ALLOWED_MIME_TYPES,
  ...WORKSPACE_CHAT_ALLOWED_EXTENSIONS.map((extension) => `.${extension}`),
].join(",");

const WORKSPACE_CHAT_UPLOAD_HINT =
  "documents, images, text, spreadsheets and presentations; up to 3 files of 10 MB each";

type WorkspaceChatAttachmentRejection = { fileName: string; reason: string };

const getWorkspaceChatFileExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
};

const isWorkspaceChatSupportedFile = (file: File) =>
  WORKSPACE_CHAT_ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
  WORKSPACE_CHAT_ALLOWED_EXTENSIONS.includes(getWorkspaceChatFileExtension(file.name));

const validateWorkspaceChatAttachments = (
  existingCount: number,
  files: readonly File[],
): { valid: File[]; rejected: WorkspaceChatAttachmentRejection[] } => {
  const valid: File[] = [];
  const rejected: WorkspaceChatAttachmentRejection[] = [];

  for (const file of files) {
    if (existingCount + valid.length >= WORKSPACE_CHAT_MAX_ATTACHMENT_COUNT) {
      rejected.push({
        fileName: file.name,
        reason: `Only ${WORKSPACE_CHAT_MAX_ATTACHMENT_COUNT} files per message.`,
      });
    } else if (file.size > WORKSPACE_CHAT_MAX_ATTACHMENT_BYTES) {
      rejected.push({ fileName: file.name, reason: `"${file.name}" is larger than 10 MB.` });
    } else if (!isWorkspaceChatSupportedFile(file)) {
      rejected.push({ fileName: file.name, reason: `"${file.name}" isn't a supported file type.` });
    } else {
      valid.push(file);
    }
  }

  return { valid, rejected };
};

const useComposerAttachmentNotice = () => {
  const attachments = useAuiState((s) => s.composer.attachments);

  return useMemo(() => {
    if (attachments.length === 0) return null;

    const parts: string[] = [];
    const overflow = attachments.length - WORKSPACE_CHAT_MAX_ATTACHMENT_COUNT;
    if (overflow > 0) {
      parts.push(
        `Only ${WORKSPACE_CHAT_MAX_ATTACHMENT_COUNT} files per message — remove ${overflow}.`,
      );
    }

    const invalid = attachments.filter(
      (attachment) =>
        attachment.file &&
        (attachment.file.size > WORKSPACE_CHAT_MAX_ATTACHMENT_BYTES ||
          !isWorkspaceChatSupportedFile(attachment.file)),
    );
    for (const attachment of invalid.slice(0, 2)) {
      const file = attachment.file;
      if (!file) continue;
      parts.push(
        file.size > WORKSPACE_CHAT_MAX_ATTACHMENT_BYTES
          ? `"${attachment.name}" is larger than 10 MB — remove it.`
          : `"${attachment.name}" isn't a supported file type — remove it.`,
      );
    }
    if (invalid.length > 2) parts.push(`(+${invalid.length - 2} more)`);

    return parts.length > 0 ? parts.join(" ") : null;
  }, [attachments]);
};

const useFileSrc = (file: File | undefined) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const useAttachmentSrc = () => {
  const { file, src } = useAuiState(
    useShallow((s): { file?: File; src?: string } => {
      if (s.attachment.type !== "image") return {};
      if (s.attachment.file) return { file: s.attachment.file };
      const src = s.attachment.content?.filter((c) => c.type === "image")[0]?.image;
      if (!src) return {};
      return { src };
    }),
  );

  return useFileSrc(file) ?? src;
};

type AttachmentPreviewProps = {
  src: string;
};

const AttachmentPreview: FC<AttachmentPreviewProps> = ({ src }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <img
      src={src}
      alt="Image Preview"
      className={cn(
        "block h-auto max-h-[80vh] w-auto max-w-full object-contain",
        isLoaded
          ? "aui-attachment-preview-image-loaded"
          : "aui-attachment-preview-image-loading invisible",
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

const AttachmentPreviewDialog: FC<PropsWithChildren> = ({ children }) => {
  const src = useAttachmentSrc();

  if (!src) return children;

  return (
    <Dialog>
      <DialogTrigger
        className="aui-attachment-preview-trigger cursor-pointer transition-colors hover:bg-hover/50"
        asChild
      >
        {children}
      </DialogTrigger>
      <DialogContent className="aui-attachment-preview-dialog-content p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-ink/60 [&>button]:p-1 [&>button]:opacity-100 [&>button]:!ring-0 [&_svg]:text-bg [&>button]:hover:[&_svg]:text-destructive">
        <DialogTitle className="aui-sr-only sr-only">Image attachment preview</DialogTitle>
        <div className="aui-attachment-preview relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-surface">
          <AttachmentPreview src={src} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AttachmentThumb: FC = () => {
  const isImage = useAuiState((s) => s.attachment.type === "image");
  const src = useAttachmentSrc();

  return (
    <Avatar className="aui-attachment-tile-avatar h-full w-full rounded-none">
      <AvatarImage
        src={src}
        alt="Attachment preview"
        className="aui-attachment-tile-image object-cover"
      />
      <AvatarFallback delayMs={isImage ? 200 : 0}>
        <FileTextIcon className="aui-attachment-tile-fallback-icon size-8 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
};

const AttachmentUI: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";

  const isImage = useAuiState((s) => s.attachment.type === "image");
  const typeLabel = useAuiState((s) => {
    const type = s.attachment.type;
    switch (type) {
      case "image":
        return "Image";
      case "document":
        return "Document";
      case "file":
        return "File";
      default:
        return type;
    }
  });

  return (
    <AttachmentPrimitive.Root
      className={cn(
        "aui-attachment-root relative",
        isImage && "aui-attachment-root-composer [&:only-child_.aui-attachment-tile]:size-24",
      )}
    >
      <AttachmentPreviewDialog>
        <Tooltip content={<AttachmentPrimitive.Name />} side="top">
          <div
            className="aui-attachment-tile size-14 cursor-pointer overflow-hidden rounded-[calc(var(--composer-radius)-var(--composer-padding))] border border-line bg-sunken transition-opacity hover:opacity-75"
            role="button"
            aria-label={`${typeLabel} attachment`}
          >
            <AttachmentThumb />
          </div>
        </Tooltip>
      </AttachmentPreviewDialog>
      {isComposer && <AttachmentRemove />}
    </AttachmentPrimitive.Root>
  );
};

const AttachmentRemove: FC = () => {
  return (
    <AttachmentPrimitive.Remove asChild>
      <TooltipIconButton
        tooltip="Remove file"
        className="aui-attachment-tile-remove absolute top-1.5 right-1.5 size-3.5 rounded-full bg-surface text-muted-foreground opacity-100 hover:!bg-surface [&_svg]:text-ink hover:[&_svg]:text-destructive"
        side="top"
      >
        <XIcon className="aui-attachment-remove-icon size-3" />
      </TooltipIconButton>
    </AttachmentPrimitive.Remove>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
      <MessagePrimitive.Attachments>{() => <AttachmentUI />}</MessagePrimitive.Attachments>
    </div>
  );
};

export const ComposerAttachments: FC = () => {
  const notice = useComposerAttachmentNotice();

  return (
    <>
      <div className="aui-composer-attachments flex w-full flex-row items-center gap-2 overflow-x-auto empty:hidden">
        <ComposerPrimitive.Attachments>{() => <AttachmentUI />}</ComposerPrimitive.Attachments>
      </div>
      {notice && (
        <p role="alert" className="aui-composer-attachments-notice text-xs text-bad">
          {notice}
        </p>
      )}
    </>
  );
};

export const ComposerAddAttachment: FC = () => {
  const aui = useAui();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={WORKSPACE_CHAT_UPLOAD_ACCEPT}
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (picked.length === 0) return;

          const existingCount = aui.composer.getState().attachments.length;
          const { valid, rejected } = validateWorkspaceChatAttachments(existingCount, picked);
          setError(
            rejected.length === 0
              ? null
              : rejected.length === 1
                ? rejected[0].reason
                : `${rejected[0].reason} (+${rejected.length - 1} more)`,
          );
          void Promise.all(valid.map((file) => aui.composer.addAttachment(file))).catch(() => {
            setError("Could not attach the file — try again.");
          });
        }}
      />
      <TooltipIconButton
        tooltip={`Add attachment (${WORKSPACE_CHAT_UPLOAD_HINT})`}
        side="bottom"
        variant="ghost"
        size="icon6"
        className="aui-composer-add-attachment size-8 rounded-full p-1 font-semibold text-xs hover:bg-hover dark:border-line dark:hover:bg-hover"
        aria-label="Add attachment"
        onClick={() => {
          setError(null);
          inputRef.current?.click();
        }}
      >
        <PlusIcon className="aui-attachment-add-icon size-5" />
      </TooltipIconButton>
      {error && (
        <span role="alert" className="min-w-0 truncate text-[11px] text-bad">
          {error}
        </span>
      )}
    </>
  );
};
