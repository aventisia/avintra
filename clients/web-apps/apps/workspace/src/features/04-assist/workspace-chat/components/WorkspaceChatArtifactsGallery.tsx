import { ChatFilePreview } from "@avplatform/chat";
import { Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle, useShowAlertHandler } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { GroupImperativeHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { HOME_CHAT_CONVERSATION_ROUTE, useIsHomeChatAvailable } from "@/features/home-chat";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { getChatArtifact } from "../apis/workspace-chat.apis";
import { useWorkspaceChatArtifacts } from "../hooks/useWorkspaceChatArtifacts.hook";
import {
  WORKSPACE_CHAT_PREVIEW_PANEL_ID,
  WORKSPACE_CHAT_THREAD_PANEL_ID,
  getWorkspaceChatPreviewSplit,
  saveWorkspaceChatPreviewSplit,
} from "../utils/workspace-chat-split-persistence.util";
import { WorkspaceChatFileCard } from "./WorkspaceChatFileCard";

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
  const previewArtifact = useQuery({
    queryKey: ["workspace-chat-artifact", previewArtifactId],
    queryFn: async () => (await getChatArtifact(previewArtifactId!)).data,
    enabled: !!previewArtifactId,
  });
  const { showCustomAlertDialog } = useShowAlertHandler();
  const isHomeChatAvailable = useIsHomeChatAvailable();

  const confirmDeleteArtifact = (artifactId: string) =>
    showCustomAlertDialog({
      isDestructive: true,
      title: "Delete artifact?",
      description: `“${artifacts.find((artifact) => artifact.id === artifactId)?.name ?? "This artifact"}” will be deleted. This can't be undone.`,
      confirmBtnText: "Delete",
      confirmActionFn: () => {
        if (previewArtifactId === artifactId) setPreviewArtifactId(null);
        deleteArtifact.mutate(artifactId);
      },
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
    <div className="flex h-[calc(100vh-2.5*var(--header-height))] w-full">
      <ResizablePanelGroup
        orientation="horizontal"
        groupRef={previewGroupRef}
        onLayoutChanged={(layout, meta) => {
          if (meta.isUserInteraction && previewArtifactId)
            saveWorkspaceChatPreviewSplit(userEmail, layout);
        }}
        className="min-h-0 flex-1"
      >
        <ResizablePanel
          id={WORKSPACE_CHAT_THREAD_PANEL_ID}
          defaultSize={previewArtifactId ? "60%" : "100%"}
          minSize="30%"
          className="flex min-h-0 flex-col overflow-hidden"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {all.isLoading ? (
              <div
                role="status"
                aria-label="Loading artifacts"
                className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-[3.75rem] rounded-xl" />
                ))}
              </div>
            ) : all.isError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-ink">Artifacts couldn&apos;t be loaded.</p>
                <Button variant="outline" size="sm" onClick={() => all.refetch()}>
                  Try again
                </Button>
              </div>
            ) : artifacts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-ink">No generated files yet</p>
                <p className="text-xs text-muted-foreground">
                  Describe a UI, document, spreadsheet, or file in the home chat and it will show up
                  here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
                {artifacts.map((artifact) => (
                  <WorkspaceChatFileCard
                    key={artifact.id}
                    artifactId={artifact.id}
                    name={artifact.name}
                    contentType={artifact.contentType}
                    sizeBytes={artifact.sizeBytes}
                    chatHref={
                      isHomeChatAvailable
                        ? `${HOME_CHAT_CONVERSATION_ROUTE}/${artifact.conversationId}`
                        : undefined
                    }
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
              <ChatFilePreview
                file={
                  previewArtifact.data
                    ? {
                        ...previewArtifact.data,
                        url: previewArtifact.data.blobPath.startsWith("data:")
                          ? previewArtifact.data.blobPath
                          : null,
                      }
                    : null
                }
                isLoading={previewArtifact.isLoading}
                onClose={() => setPreviewArtifactId(null)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
