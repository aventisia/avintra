import { useDocumentTitle, useShowAlertHandler } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useEffect, useRef, useState } from "react";
import type { GroupImperativeHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { useWorkspaceChatArtifacts } from "../hooks/useWorkspaceChatArtifacts.hook";
import {
  WORKSPACE_CHAT_PREVIEW_PANEL_ID,
  WORKSPACE_CHAT_THREAD_PANEL_ID,
  getWorkspaceChatPreviewSplit,
  saveWorkspaceChatPreviewSplit,
} from "../utils/workspace-chat-split-persistence.util";
import { WorkspaceChatFileCard } from "./WorkspaceChatFileCard";
import { WorkspaceChatPreviewPanel } from "./WorkspaceChatPreviewPanel";

/**
 * Sidebar gallery of every stored artifact; a card opens the file in the preview panel.
 */
export const WorkspaceChatArtifactsGallery = () => {
  useDocumentTitle("Artifacts - Assist");
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  const { all, deleteArtifact } = useWorkspaceChatArtifacts();
  const artifacts = all.data?.data ?? [];
  const [previewArtifactId, setPreviewArtifactId] = useState<string | null>(null);
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const confirmDeleteArtifact = (artifactId: string) =>
    showDefaultAlertDialog({
      confirmActionFn: () => {
        if (previewArtifactId === artifactId) setPreviewArtifactId(null);
        deleteArtifact.mutate(artifactId);
      },
      alertType: "delete-record",
      additionalText: "artifact",
    });

  const userEmail = userSession?.email ?? "anonymous";
  const [initialPreviewSplit] = useState(() => getWorkspaceChatPreviewSplit(userEmail));
  const previewGroupRef = useRef<GroupImperativeHandle | null>(null);
  const wasPreviewOpenRef = useRef(false);
  useEffect(() => {
    const isOpen = previewArtifactId !== null;
    if (isOpen && !wasPreviewOpenRef.current && initialPreviewSplit) {
      try {
        previewGroupRef.current?.setLayout(initialPreviewSplit);
      } catch (error) {
        console.error("Workspace chat preview layout restore failed:", error);
      }
    }
    wasPreviewOpenRef.current = isOpen;
  }, [previewArtifactId, initialPreviewSplit]);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      groupRef={previewGroupRef}
      onLayoutChanged={(layout, meta) => {
        if (meta.isUserInteraction && previewArtifactId)
          saveWorkspaceChatPreviewSplit(userEmail, layout);
      }}
      className="h-[calc(100vh-2.5*var(--header-height))] w-full"
    >
      <ResizablePanel
        id={WORKSPACE_CHAT_THREAD_PANEL_ID}
        defaultSize={previewArtifactId ? "60%" : "100%"}
        minSize="30%"
        className="flex min-h-0 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {all.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading artifacts…</p>
          ) : all.isError ? (
            <p className="text-sm text-bad">Artifacts couldn&apos;t be loaded.</p>
          ) : artifacts.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm font-medium text-ink">No generated files yet</p>
              <p className="text-xs text-muted-foreground">
                Describe a UI in the home chat and it will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {artifacts.map((artifact) => (
                <WorkspaceChatFileCard
                  key={artifact.id}
                  artifactId={artifact.id}
                  name={artifact.name}
                  contentType={artifact.contentType}
                  sizeBytes={artifact.sizeBytes}
                  onPreview={setPreviewArtifactId}
                  onDelete={confirmDeleteArtifact}
                />
              ))}
            </div>
          )}
        </div>
      </ResizablePanel>

      {previewArtifactId && (
        <>
          <ResizableHandle withHandle className="w-1 bg-transparent" />

          <ResizablePanel
            id={WORKSPACE_CHAT_PREVIEW_PANEL_ID}
            defaultSize="40%"
            minSize="25%"
            className="flex min-h-0 flex-col overflow-hidden border-l border-line"
          >
            <WorkspaceChatPreviewPanel
              artifactId={previewArtifactId}
              onClose={() => setPreviewArtifactId(null)}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};
