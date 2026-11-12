import {
  DeleteDDMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import {
  CaretDownIcon,
  DownloadSimpleIcon,
  FilePdfIcon,
  LinkBreakIcon,
  LinkSimpleIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { ChatTitleInput } from "./ChatTitleInput";

type ChatTitleProps = {
  title: string;
  onRename: (title: string) => void;
  onExport: () => void;
  onExportPdf: () => void;
  onDelete: () => void;
  /** Copies the read-only share link; without it no share item is shown. */
  onCopyShareLink?: () => void;
  /** Stops sharing; without it no stop-sharing item is shown. */
  onStopSharing?: () => void;
};

/** The open chat's title as a menu of Rename (edits it in place), Export and Delete. */
export const ChatTitle = ({
  title,
  onRename,
  onExport,
  onExportPdf,
  onDelete,
  onCopyShareLink,
  onStopSharing,
}: ChatTitleProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const isRenamingRef = useRef(false);

  if (isRenaming)
    return (
      <div className="w-full max-w-sm">
        <ChatTitleInput
          title={title}
          onDone={(next) => {
            setIsRenaming(false);
            if (next && next !== title) onRename(next);
          }}
        />
      </div>
    );

  return (
    <h2 className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          title={title}
          className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-hover"
        >
          <span className="truncate">{title}</span>
          <CaretDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="flex min-w-36 flex-col"
          onCloseAutoFocus={(event) => {
            // The rename input takes focus instead of the menu trigger.
            if (isRenamingRef.current) event.preventDefault();
            isRenamingRef.current = false;
          }}
        >
          <SimpleDDMenuItem
            content="Rename"
            Icon={PencilSimpleIcon}
            onSelect={() => {
              isRenamingRef.current = true;
              setIsRenaming(true);
            }}
          />
          <SimpleDDMenuItem
            content="Export as Markdown"
            Icon={DownloadSimpleIcon}
            onSelect={onExport}
          />
          <SimpleDDMenuItem content="Export as PDF" Icon={FilePdfIcon} onSelect={onExportPdf} />
          {onCopyShareLink && (
            <SimpleDDMenuItem
              content="Copy read-only link"
              Icon={LinkSimpleIcon}
              onSelect={onCopyShareLink}
            />
          )}
          {onStopSharing && (
            <SimpleDDMenuItem
              content="Stop sharing"
              Icon={LinkBreakIcon}
              onSelect={onStopSharing}
            />
          )}
          <DeleteDDMenuItem onSelect={onDelete} />
        </DropdownMenuContent>
      </DropdownMenu>
    </h2>
  );
};
