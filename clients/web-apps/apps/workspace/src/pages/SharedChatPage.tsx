import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";

import { useIsHomeChatAvailable } from "@/features/home-chat";

const SharedChatLayout = lazy(() =>
  import("@/features/home-chat/components/SharedChatLayout").then((module) => ({
    default: module.SharedChatLayout,
  })),
);

/** Renders a shared Home chat as a read-only transcript, for signed-in members with the link. */
export const SharedChatPage = () => {
  const isHomeChatAvailable = useIsHomeChatAvailable();
  const { shareToken } = useParams();
  if (!isHomeChatAvailable || !shareToken) return null;

  return (
    <Suspense>
      <SharedChatLayout key={shareToken} shareToken={shareToken} />
    </Suspense>
  );
};
