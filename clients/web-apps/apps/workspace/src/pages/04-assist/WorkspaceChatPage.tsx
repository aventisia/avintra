import { Suspense, lazy } from "react";

// Lazy load the landing chat layout.
const WorkspaceChatLayout = lazy(() =>
  import("@/features/04-assist/workspace-chat/components/WorkspaceChatLayout").then((module) => ({
    default: module.WorkspaceChatLayout,
  })),
);

/**
 * Renders the agent-less Workspace landing chat.
 */
export const WorkspaceChatPage = () => {
  return (
    <Suspense>
      <WorkspaceChatLayout />
    </Suspense>
  );
};
