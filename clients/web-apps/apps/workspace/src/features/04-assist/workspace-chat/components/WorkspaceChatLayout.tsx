import { useDocumentTitle } from "@avplatform/ui/hooks";

import { WorkspaceChatPanel } from "./WorkspaceChatPanel";

/**
 * Renders the home chat thread full-height without a conversation list.
 */
export const WorkspaceChatLayout = () => {
  useDocumentTitle("Chat - Assist");

  return (
    <div className="flex h-[calc(100vh-2.5*var(--header-height))] w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1">
        <WorkspaceChatPanel />
      </div>
    </div>
  );
};
