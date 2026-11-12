import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";

import { useIsHomeChatAvailable } from "@/features/home-chat";

const SharedArtifactLayout = lazy(() =>
  import("@/features/home-chat/components/SharedArtifactLayout").then((module) => ({
    default: module.SharedArtifactLayout,
  })),
);

/** Renders a shared chat file as a read-only preview, for signed-in members with the link. */
export const SharedArtifactPage = () => {
  const isHomeChatAvailable = useIsHomeChatAvailable();
  const { shareToken } = useParams();
  if (!isHomeChatAvailable || !shareToken) return null;

  return (
    <Suspense>
      <SharedArtifactLayout key={shareToken} shareToken={shareToken} />
    </Suspense>
  );
};
