import { ChatFilePreview, toDataUrl } from "@avplatform/chat";
import { Input, Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GroupImperativeHandle } from "react-resizable-panels";
import { useShallow } from "zustand/react/shallow";

import { HOME_CHAT_CONVERSATION_ROUTE, useIsHomeChatAvailable } from "@/features/home-chat";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { createChatArtifact, getChatArtifact } from "../apis/workspace-chat.apis";
import {
  WORKSPACE_CHAT_ARTIFACTS_KEY,
  useWorkspaceChatArtifacts,
} from "../hooks/useWorkspaceChatArtifacts.hook";
import {
  ARTIFACT_KIND_LABELS,
  ARTIFACT_SORT_LABELS,
  type ArtifactKind,
  type ArtifactSort,
  filterArtifacts,
  latestArtifacts,
} from "../utils/workspace-chat-artifact-filter.util";
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
  const { all, deleteArtifact, deleteArtifacts } = useWorkspaceChatArtifacts();
  const artifacts = useMemo(() => latestArtifacts(all.data?.data ?? []), [all.data]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<ArtifactKind>("all");
  const [sort, setSort] = useState<ArtifactSort>("newest");
  const visibleArtifacts = useMemo(
    () => filterArtifacts(artifacts, { search, kind, sort }),
    [artifacts, search, kind, sort],
  );
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const selectedArtifactIds = artifacts
    .filter((artifact) => selectedIds.has(artifact.id))
    .map((artifact) => artifact.id);
  const toggleSelected = (artifactId: string, selected: boolean) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(artifactId);
      else next.delete(artifactId);
      return next;
    });
  const [previewArtifactId, setPreviewArtifactId] = useState<string | null>(null);
  const previewArtifact = useQuery({
    queryKey: ["workspace-chat-artifact", previewArtifactId],
    queryFn: async () => (await getChatArtifact(previewArtifactId!)).data,
    enabled: !!previewArtifactId,
  });
  const previewVersions = useMemo(
    () =>
      previewArtifact.data
        ? (all.data?.data ?? [])
            .filter(
              (artifact) =>
                artifact.conversationId === previewArtifact.data!.conversationId &&
                artifact.name === previewArtifact.data!.name,
            )
            .map((artifact) => ({ id: artifact.id, versionNumber: artifact.versionNumber }))
        : [],
    [all.data, previewArtifact.data],
  );
  const { showCustomAlertDialog } = useShowAlertHandler();
  const queryClient = useQueryClient();
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const isHomeChatAvailable = useIsHomeChatAvailable();

  const saveVersion = async (body: string) => {
    const current = previewArtifact.data;
    if (!current || isSavingVersion) return;
    if (new Blob([body]).size > 10 * 1024 * 1024) {
      showCustomAlertDialog({
        isDestructive: false,
        title: "File too large",
        description: "Each file must be 10 MB or smaller.",
        confirmBtnText: "OK",
        confirmActionFn: () => {},
      });
      return;
    }
    setIsSavingVersion(true);
    try {
      const saved = await createChatArtifact({
        conversationId: current.conversationId,
        name: current.name,
        contentType: current.contentType,
        sizeBytes: new Blob([body]).size,
        blobPath: toDataUrl(current.contentType, body),
        sourceArtifact: null,
        origin: "Generated",
      });
      await queryClient.invalidateQueries({ queryKey: WORKSPACE_CHAT_ARTIFACTS_KEY });
      setPreviewArtifactId(saved.data.id);
    } catch {
      showCustomAlertDialog({
        isDestructive: false,
        title: "Version not saved",
        description: "The edited file could not be saved. Try again.",
        confirmBtnText: "OK",
        confirmActionFn: () => {},
      });
    } finally {
      setIsSavingVersion(false);
    }
  };

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

  const confirmDeleteSelected = () =>
    showCustomAlertDialog({
      isDestructive: true,
      title: `Delete ${selectedArtifactIds.length} ${selectedArtifactIds.length === 1 ? "artifact" : "artifacts"}?`,
      description: "The selected files will be deleted. This can't be undone.",
      confirmBtnText: "Delete",
      showLoadingOnConfirm: true,
      confirmActionFn: async () => {
        await deleteArtifacts.mutateAsync(selectedArtifactIds);
        if (previewArtifactId && selectedArtifactIds.includes(previewArtifactId))
          setPreviewArtifactId(null);
        setSelectedIds(new Set());
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
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full max-w-xs">
                    <MagnifyingGlassIcon
                      aria-hidden
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search files or chats"
                      aria-label="Search artifacts"
                      className="h-8 pl-8 text-sm"
                    />
                  </div>
                  <Select value={kind} onValueChange={(value) => setKind(value as ArtifactKind)}>
                    <SelectTrigger aria-label="File type" className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ARTIFACT_KIND_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sort} onValueChange={(value) => setSort(value as ArtifactSort)}>
                    <SelectTrigger aria-label="Sort by" className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ARTIFACT_SORT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedArtifactIds.length > 0 ? (
                    <div className="ml-auto flex items-center gap-1">
                      <span className="mr-1 text-sm text-ink" aria-live="polite">
                        {selectedArtifactIds.length} selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedIds(new Set(visibleArtifacts.map((artifact) => artifact.id)))
                        }
                      >
                        Select all
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                        Clear
                      </Button>
                      <Button variant="destructive" size="sm" onClick={confirmDeleteSelected}>
                        <TrashIcon className="size-4" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {visibleArtifacts.length} of {artifacts.length} files
                    </span>
                  )}
                </div>
                {visibleArtifacts.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No files match these filters.
                  </p>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
                    {visibleArtifacts.map((artifact) => (
                      <WorkspaceChatFileCard
                        key={artifact.id}
                        artifactId={artifact.id}
                        name={artifact.name}
                        contentType={artifact.contentType}
                        sizeBytes={artifact.sizeBytes}
                        createdOn={artifact.createdOn}
                        conversationTitle={artifact.conversationTitle}
                        versionNumber={artifact.versionNumber}
                        selected={selectedIds.has(artifact.id)}
                        onSelectedChange={toggleSelected}
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
              </>
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
                versions={previewVersions}
                activeVersionId={previewArtifactId ?? undefined}
                onSelectVersion={setPreviewArtifactId}
                onSaveVersion={saveVersion}
                isSavingVersion={isSavingVersion}
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
