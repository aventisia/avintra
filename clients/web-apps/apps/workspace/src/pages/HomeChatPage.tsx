import { Suspense, lazy } from "react";

import { useIsHomeChatAvailable } from "@/features/home-chat";

const HomeChatLayout = lazy(() =>
  import("@/features/home-chat/components/HomeChatLayout").then((module) => ({
    default: module.HomeChatLayout,
  })),
);

/** Renders Home, the chat-first landing page, for users it is available to. */
export const HomeChatPage = () => {
  const isHomeChatAvailable = useIsHomeChatAvailable();
  if (!isHomeChatAvailable) return null;

  return (
    <Suspense>
      <HomeChatLayout />
    </Suspense>
  );
};
