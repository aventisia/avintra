import { Badge } from "@avplatform/ui/badge";
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
  LinkSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { CHAT_TITLE_MAX_LENGTH } from "../constants/chat-name.constant";
import { useInlineEditFocusGuard } from "../hooks/useInlineEditFocusGuard.hook";
import { ChatNameInput } from "./ChatNameInput";

type ChatTitleProps = {
  title: string;
  onRename: (title: string) => void;
  onExport: () => void;
  onExportPdf: () => void;
  onDelete: () => void;
  /** Opens the share dialog; without it no share item is shown. */
  onShare?: () => void;
  /** Shows a "Shared" badge while a read-only link is active. */
  isShared?: boolean;
};

/** The open chat's title as a menu of Rename (edits it in place), Export and Delete. */
export const ChatTitle = ({
  title,
  onRename,
  onExport,
  onExportPdf,
  onDelete,
  onShare,
  isShared = false,
}: ChatTitleProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const focusGuard = useInlineEditFocusGuard();

  if (isRenaming)
    return (
      <div className="w-full max-w-sm">
        <ChatNameInput
          initialName={title}
          label="Chat title"
          maxLength={CHAT_TITLE_MAX_LENGTH}
          onDone={(next) => {
            setIsRenaming(false);
            if (next && next !== title) onRename(next);
          }}
        />
      </div>
    );

  return (
    <h2 className="flex min-w-0 items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          title={title}
          className="inline-flex h-8 min-w-0 max-w-full items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-hover"
        >
          <span className="truncate">{title}</span>
          <CaretDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="flex min-w-36 max-w-xs flex-col"
          onCloseAutoFocus={focusGuard.onCloseAutoFocus}
        >
          <SimpleDDMenuItem
            content="Rename"
            Icon={PencilSimpleIcon}
            onSelect={() => {
              focusGuard.markEditing();
              setIsRenaming(true);
            }}
          />
          <SimpleDDMenuItem
            content="Export as Markdown"
            Icon={DownloadSimpleIcon}
            onSelect={onExport}
          />
          <SimpleDDMenuItem content="Export as PDF" Icon={FilePdfIcon} onSelect={onExportPdf} />
          {onShare && (
            <SimpleDDMenuItem content="Share" Icon={ShareNetworkIcon} onSelect={onShare} />
          )}
          <DeleteDDMenuItem onSelect={onDelete} />
        </DropdownMenuContent>
      </DropdownMenu>
      {isShared && (
        <Badge variant="secondary" className="shrink-0 gap-1">
          <LinkSimpleIcon className="size-3" />
          Shared
        </Badge>
      )}
    </h2>
  );
};
