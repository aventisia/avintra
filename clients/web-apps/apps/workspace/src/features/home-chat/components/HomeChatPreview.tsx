import { ChatFilePreview, type ChatPreviewFile, type ChatPreviewVersion } from "@avplatform/chat";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import { useContext, useEffect } from "react";

import { HomeChatRailYieldContext } from "../constants/home-chat-rail.constant";
import { useMediaQuery } from "../hooks/useMediaQuery.hook";

type HomeChatPreviewProps = {
  file: ChatPreviewFile | null;
  versions?: ChatPreviewVersion[];
  activeVersionId?: string;
  onSelectVersion?: (id: string) => void;
  onSaveVersion?: (body: string) => void | Promise<unknown>;
  isSavingVersion?: boolean;
  isLoading: boolean;
  onClose: () => void;
};

const useReturnFocusOnClose = () =>
  useEffect(() => {
    const opener = document.activeElement;
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

/** The open file: a panel beside the thread from 1024px, a full-screen sheet below. */
export const HomeChatPreview = ({
  file,
  versions,
  activeVersionId,
  onSelectVersion,
  onSaveVersion,
  isSavingVersion,
  isLoading,
  onClose,
}: HomeChatPreviewProps) => {
  useReturnFocusOnClose();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const yieldRail = useContext(HomeChatRailYieldContext);
  useEffect(() => {
    if (!isWide) return;
    yieldRail(true);
    return () => yieldRail(false);
  }, [isWide, yieldRail]);
  const preview = (
    <ChatFilePreview
      file={file}
      versions={versions}
      activeVersionId={activeVersionId}
      onSelectVersion={onSelectVersion}
      onSaveVersion={onSaveVersion}
      isSavingVersion={isSavingVersion}
      isLoading={isLoading}
      onClose={onClose}
    />
  );

  if (isWide)
    return (
      <aside className="w-[min(50%,44rem)] shrink-0 border-l border-line duration-200 animate-in fade-in-0 slide-in-from-right-4 motion-reduce:animate-none">
        {preview}
      </aside>
    );

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        side="right"
        aria-describedby={undefined}
        className="w-full max-w-none rounded-none p-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:max-w-none"
      >
        <DialogTitle className="sr-only">{file?.name ?? "File preview"}</DialogTitle>
        {preview}
      </DialogContent>
    </Dialog>
  );
};
