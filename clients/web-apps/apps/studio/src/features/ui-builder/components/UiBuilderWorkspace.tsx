import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { createUiBuilderVersion } from "../apis/ui-builder.apis";
import { DEFAULT_UI_BUILDER_MODEL } from "../constants/ui-builder-models.constant";
import { CreateUiBuilderVersionPayload } from "../dtos/ui-builder-dto";
import { useUiBuilderGeneration } from "../hooks/useUiBuilderGeneration.hook";
import { useUiBuilderModels } from "../hooks/useUiBuilderModels.hook";
import {
  UI_BUILDER_VERSIONS_QUERY_KEY,
  useUiBuilderProject,
} from "../hooks/useUiBuilderProject.hook";
import {
  clearUiBuilderChatHistory,
  deriveUiBuilderHistory,
  getUiBuilderChatHistory,
  getUiBuilderSaveAckText,
  mergeUiBuilderHistory,
  saveUiBuilderChatHistory,
} from "../utils/ui-builder-chat-persistence.util";
import {
  UI_BUILDER_CHAT_PANEL_ID,
  UI_BUILDER_PREVIEW_PANEL_ID,
  getUiBuilderSplit,
  saveUiBuilderSplit,
} from "../utils/ui-builder-split-persistence.util";
import { type UiBuilderChatMessage, UiBuilderChatPanel } from "./UiBuilderChatPanel";
import { UiBuilderPreview } from "./UiBuilderPreview";

interface UiBuilderWorkspaceProps {
  projectId: string;
}

const workspaceHref = `${import.meta.env.VITE_WORKSPACE_PATH}ui-builder`;

const DEFAULT_CHAT_PANEL_SIZE = 320;
const MIN_CHAT_PANEL_SIZE = 320;
const MIN_PREVIEW_PANEL_SIZE = 256;

const UiBuilderGoneState = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
    <p className="text-sm font-medium">This UI builder project is not available.</p>
    <a href={workspaceHref} className="text-sm text-primary underline">
      Back to UI Builder projects
    </a>
  </div>
);

const appendDerivedPairs = (
  previous: UiBuilderChatMessage[],
  derived: UiBuilderChatMessage[],
): UiBuilderChatMessage[] => {
  const next = [...previous];
  const existingIds = new Set(previous.map((message) => message.id));

  for (let index = 0; index + 1 < derived.length; index += 2) {
    const user = derived[index];
    const assistant = derived[index + 1];
    if (user.role !== "user" || assistant.role !== "assistant") continue;
    if (existingIds.has(user.id) || existingIds.has(assistant.id)) continue;

    const matchIndex = next.findIndex(
      (message, messageIndex) =>
        message.role === "user" &&
        message.text === user.text &&
        next[messageIndex + 1]?.role === "assistant" &&
        next[messageIndex + 1]?.text === assistant.text,
    );

    if (matchIndex >= 0) next.splice(matchIndex, 2, user, assistant);
    else next.push(user, assistant);

    existingIds.add(user.id);
    existingIds.add(assistant.id);
  }

  return next;
};

export const UiBuilderWorkspace = ({ projectId }: UiBuilderWorkspaceProps) => {
  const queryClient = useQueryClient();
  const { projectQuery, versionsQuery } = useUiBuilderProject(projectId);
  const { models, hasAnyEnabled, initialModel } = useUiBuilderModels();
  const { generate } = useUiBuilderGeneration();

  const userEmail = useUserSessionStore((state) => state.userSession?.email ?? "anonymous");
  const [initialSplit] = useState(() => getUiBuilderSplit(userEmail, projectId));

  const project = projectQuery.data?.data;

  const versions = useMemo(
    () =>
      [...(versionsQuery.data?.data ?? [])].sort(
        (left, right) => right.versionNumber - left.versionNumber,
      ),
    [versionsQuery.data],
  );
  const headVersion = versions[0];

  const [selectedModel, setSelectedModel] = useState(DEFAULT_UI_BUILDER_MODEL);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<UiBuilderChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingHtml, setPendingHtml] = useState<string | null>(null);
  const pendingPayloadRef = useRef<CreateUiBuilderVersionPayload | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const clearedThroughVersionRef = useRef(0);
  const reconciledVersionRef = useRef(0);
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const isEnabled = models.some((model) => model.model === selectedModel && model.enabled);
    if (!isEnabled) setSelectedModel(initialModel);
  }, [models, initialModel, selectedModel]);

  useEffect(() => {
    if (isHistoryHydrated) return;
    if (!versionsQuery.isSuccess && !versionsQuery.isError) return;

    const persisted = getUiBuilderChatHistory(userEmail, projectId);
    const derived = versionsQuery.isSuccess
      ? deriveUiBuilderHistory(versionsQuery.data?.data ?? [])
      : [];
    const clearedThroughVersion = persisted?.clearedThroughVersion ?? 0;

    clearedThroughVersionRef.current = clearedThroughVersion;
    reconciledVersionRef.current = versionsQuery.isSuccess
      ? (versionsQuery.data?.data ?? []).reduce(
          (max, version) => Math.max(max, version.versionNumber),
          0,
        )
      : 0;
    setMessages(mergeUiBuilderHistory(derived, persisted?.messages ?? [], clearedThroughVersion));
    setIsHistoryHydrated(true);
  }, [
    isHistoryHydrated,
    versionsQuery.isSuccess,
    versionsQuery.isError,
    versionsQuery.data,
    userEmail,
    projectId,
  ]);

  useEffect(() => {
    if (!isHistoryHydrated) return;

    saveUiBuilderChatHistory(userEmail, projectId, {
      version: 1,
      messages,
      clearedThroughVersion: clearedThroughVersionRef.current,
    });
  }, [isHistoryHydrated, messages, userEmail, projectId]);

  useEffect(() => {
    if (!isHistoryHydrated || !versionsQuery.isSuccess) return;

    const versionsData = versionsQuery.data?.data ?? [];
    const latestVersionNumber = versionsData.reduce(
      (max, version) => Math.max(max, version.versionNumber),
      0,
    );
    if (latestVersionNumber <= reconciledVersionRef.current) return;

    const derived = deriveUiBuilderHistory(
      versionsData.filter((version) => version.versionNumber > reconciledVersionRef.current),
    );
    reconciledVersionRef.current = latestVersionNumber;

    setMessages((previous) => appendDerivedPairs(previous, derived));
  }, [isHistoryHydrated, versionsQuery.isSuccess, versionsQuery.data]);

  const patchMessage = (id: string, patch: Partial<UiBuilderChatMessage>) =>
    setMessages((prev) =>
      prev.map((message) => (message.id === id ? { ...message, ...patch } : message)),
    );

  const versionsQueryKey = [...UI_BUILDER_VERSIONS_QUERY_KEY, projectId];

  const invalidateVersions = () => queryClient.invalidateQueries({ queryKey: versionsQueryKey });

  const saveVersionMutation = useMutation({
    mutationFn: (payload: CreateUiBuilderVersionPayload) =>
      createUiBuilderVersion(projectId, payload),
    onSuccess: (created) => {
      const assistantId = activeAssistantIdRef.current;
      if (assistantId) {
        const versionNumber = created.data?.versionNumber;
        patchMessage(assistantId, {
          text: getUiBuilderSaveAckText(versionNumber),
          status: undefined,
        });
      }
      pendingPayloadRef.current = null;
      setPendingHtml(null);
      invalidateVersions();
    },
    onError: (error) => {
      const assistantId = activeAssistantIdRef.current;
      if (assistantId) {
        patchMessage(assistantId, {
          text: "The page was generated but could not be saved as a version.",
          status: "error",
        });
      }
      toast.error(`The page was generated but could not be saved as a version. ${String(error)}`);
    },
  });

  const activeModel = models.find((model) => model.model === selectedModel);

  const handleSend = async () => {
    const trimmedPrompt = prompt.trim();
    if (!activeModel?.enabled || !hasAnyEnabled || !trimmedPrompt || isGenerating) return;

    const assistantId = crypto.randomUUID();
    activeAssistantIdRef.current = assistantId;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmedPrompt },
      {
        id: assistantId,
        role: "assistant",
        text: "Generating the interface…",
        status: "streaming",
      },
    ]);
    setPrompt("");
    setIsGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let streamedCharacters = 0;

    try {
      const html = await generate({
        projectId,
        projectName: project?.name ?? "UI Builder",
        model: activeModel,
        prompt: trimmedPrompt,
        currentHtml: headVersion?.generatedHtml ?? "",
        signal: controller.signal,
        onDelta: (delta) => {
          streamedCharacters += delta.length;
          patchMessage(assistantId, {
            text: `Generating the interface… ${streamedCharacters.toLocaleString()} characters`,
          });
        },
      });

      const payload: CreateUiBuilderVersionPayload = {
        promptText: trimmedPrompt,
        generatedHtml: html,
        provider: activeModel.provider,
        model: activeModel.model,
      };

      setPendingHtml(html);
      pendingPayloadRef.current = payload;
      patchMessage(assistantId, { text: "Generation complete. Saving version…" });
      saveVersionMutation.mutate(payload);
    } catch (error) {
      if (controller.signal.aborted) {
        patchMessage(assistantId, { text: "Generation stopped.", status: "error" });
      } else {
        patchMessage(assistantId, {
          text: error instanceof Error ? error.message : String(error),
          status: "error",
        });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => abortRef.current?.abort();

  const handleClearHistory = () => {
    const watermark = headVersion?.versionNumber ?? 0;
    clearedThroughVersionRef.current = watermark;
    reconciledVersionRef.current = watermark;
    clearUiBuilderChatHistory(userEmail, projectId, watermark);
    setMessages([]);
  };

  if (projectQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Loading project...
      </div>
    );
  }

  if (projectQuery.isError || !project) {
    return <UiBuilderGoneState />;
  }

  const previewHtml = pendingHtml ?? headVersion?.generatedHtml ?? "";
  const saveFailed = saveVersionMutation.isError && pendingHtml !== null;

  return (
    <div className="flex h-full w-full flex-col border-b border-slate-200">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2">
        <a
          href={workspaceHref}
          className="inline-flex items-center gap-1 text-2xs font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </a>
        <p className="truncate text-sm font-semibold">{project.name}</p>
        <span className="w-12" />
      </div>

      {/* Left chat panel / right preview */}
      <ResizablePanelGroup
        orientation="horizontal"
        defaultLayout={initialSplit ?? undefined}
        onLayoutChanged={(layout, meta) => {
          if (meta.isUserInteraction) saveUiBuilderSplit(userEmail, projectId, layout);
        }}
        className="min-h-0 flex-1 bg-slate-200"
      >
        <ResizablePanel
          id={UI_BUILDER_CHAT_PANEL_ID}
          defaultSize={DEFAULT_CHAT_PANEL_SIZE}
          minSize={MIN_CHAT_PANEL_SIZE}
          collapsible={false}
          className="overflow-hidden"
        >
          <UiBuilderChatPanel
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            messages={messages}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSend={handleSend}
            onStop={handleStop}
            onClearHistory={handleClearHistory}
            isGenerating={isGenerating}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="mr-px w-1.5 bg-transparent" />

        <ResizablePanel
          id={UI_BUILDER_PREVIEW_PANEL_ID}
          minSize={MIN_PREVIEW_PANEL_SIZE}
          collapsible={false}
          className="overflow-hidden"
        >
          <div className="relative flex h-full min-h-0 flex-col border-r border-slate-200">
            {saveFailed && (
              <div className="flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-2xs text-amber-700">
                <span>The generated page was not saved as a version.</span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    pendingPayloadRef.current &&
                    saveVersionMutation.mutate(pendingPayloadRef.current)
                  }
                >
                  Retry save
                </Button>
              </div>
            )}
            <div className="min-h-0 flex-1">
              <UiBuilderPreview html={previewHtml} title={project.name} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
