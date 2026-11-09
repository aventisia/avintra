import { Suspense, lazy } from "react";

// Lazy load the artifact gallery.
const WorkspaceChatArtifactsGallery = lazy(() =>
  import("@/features/04-assist/workspace-chat/components/WorkspaceChatArtifactsGallery").then(
    (module) => ({
      default: module.WorkspaceChatArtifactsGallery,
    }),
  ),
);

/**
 * Renders the stored artifact gallery.
 */
export const WorkspaceChatArtifactsPage = () => {
  return (
    <Suspense>
      <WorkspaceChatArtifactsGallery />
    </Suspense>
  );
};
