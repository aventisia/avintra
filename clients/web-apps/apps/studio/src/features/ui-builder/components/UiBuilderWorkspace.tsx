import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import {
  UiBuilderCalculationsButton,
  type UiBuilderRuntimeError,
  useUiBuilderCalculations,
} from "@avplatform/ui/ui-builder-host";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Database, Wand2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { createUiBuilderVersion } from "../apis/ui-builder.apis";
import { buildUiBuilderDataPrompt } from "../constants/ui-builder-data-prompt.constant";
import { type UiBuilderContentFormat } from "../constants/ui-builder-framework.constant";
import {
  buildUiBuilderSelectionBlock,
  buildUiBuilderTextEditPrompt,
} from "../constants/ui-builder-selection.constant";
import { CreateUiBuilderVersionPayload } from "../dtos/ui-builder-dto";
import { useUiBuilderAgent } from "../hooks/useUiBuilderAgent.hook";
import { useUiBuilderDataConnections } from "../hooks/useUiBuilderDataConnections.hook";
import { useUiBuilderModels } from "../hooks/useUiBuilderModels.hook";
import {
  UI_BUILDER_VERSIONS_QUERY_KEY,
  useUiBuilderProject,
} from "../hooks/useUiBuilderProject.hook";
import { type UiBuilderChatMessage } from "../types/ui-builder-chat.type";
import { type UiBuilderSelection } from "../types/ui-builder-selection.type";
import { applyUiBuilderTextEdit, injectUiBuilderBridge } from "../utils/ui-builder-bridge.util";
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
import { UiBuilderChatPanel } from "./UiBuilderChatPanel";
import { UiBuilderCodeView } from "./UiBuilderCodeView";
import { UiBuilderDataPanel } from "./UiBuilderDataPanel";
import { UiBuilderEditTextDialog } from "./UiBuilderEditTextDialog";
import { UiBuilderPreview } from "./UiBuilderPreview";
import {
  type UiBuilderDevice,
  UiBuilderPreviewToolbar,
  type UiBuilderViewMode,
} from "./UiBuilderPreviewToolbar";

type UiBuilderWorkspaceProps = {
  projectId: string;
};

type UiBuilderPendingDraft = {
  html: string;
  source: string | null;
  format: UiBuilderContentFormat;
};

const workspaceHref = `${import.meta.env.VITE_WORKSPACE_PATH}ui-builder`;

const DEFAULT_CHAT_PANEL_SIZE = 380;
const MIN_CHAT_PANEL_SIZE = 320;
const MIN_PREVIEW_PANEL_SIZE = 256;
const DEFAULT_FORMAT: UiBuilderContentFormat = "framework";
const OWNER_ACCESS_LEVEL = "Owner";
const MODEL_STORAGE_PREFIX = "studio-ui-builder-model";

const normalizeUiBuilderFormat = (value?: string): UiBuilderContentFormat =>
  value === "html" ? "html" : "framework";

const readStoredModelKey = (userEmail: string) => {
  try {
    return localStorage.getItem(`${MODEL_STORAGE_PREFIX}:${userEmail}`) ?? "";
  } catch {
    return "";
  }
};

const storeModelKey = (userEmail: string, modelKey: string) => {
  try {
    localStorage.setItem(`${MODEL_STORAGE_PREFIX}:${userEmail}`, modelKey);
  } catch {
    return;
  }
};

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
  const { models, groups, hasUsableModel, initialModelKey, isLoading, isError, isSuccess } =
    useUiBuilderModels();
  const agent = useUiBuilderAgent();

  const userEmail = useUserSessionStore((state) => state.userSession?.email ?? "anonymous");
  const [initialSplit] = useState(() => getUiBuilderSplit(userEmail, projectId));

  const project = projectQuery.data?.data;
  const isOwner = project?.accessLevel === OWNER_ACCESS_LEVEL;
  const data = useUiBuilderDataConnections(project);
  const calculations = useUiBuilderCalculations();

  const versions = useMemo(
    () =>
      [...(versionsQuery.data?.data ?? [])].sort(
        (left, right) => right.versionNumber - left.versionNumber,
      ),
    [versionsQuery.data],
  );
  const headVersion = versions[0];
  const headVersionNumber = headVersion?.versionNumber;
  const headFormat = headVersion
    ? normalizeUiBuilderFormat(headVersion.contentFormat)
    : DEFAULT_FORMAT;

  const [selectedModelKey, setSelectedModelKey] = useState(() => readStoredModelKey(userEmail));
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<UiBuilderChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<UiBuilderPendingDraft | null>(null);
  const [formatOverride, setFormatOverride] = useState<UiBuilderContentFormat | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selection, setSelection] = useState<UiBuilderSelection | null>(null);
  const [viewMode, setViewMode] = useState<UiBuilderViewMode>("preview");
  const [device, setDevice] = useState<UiBuilderDevice>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [runtimeError, setRuntimeError] = useState<UiBuilderRuntimeError | null>(null);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [isEditTextOpen, setIsEditTextOpen] = useState(false);
  const pendingPayloadRef = useRef<CreateUiBuilderVersionPayload | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const clearedThroughVersionRef = useRef(0);
  const reconciledVersionRef = useRef(0);
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setSelection(null);
    setFormatOverride(null);
    setRuntimeError(null);
  }, [headVersionNumber]);

  const resetCalculations = calculations.reset;
  useEffect(() => resetCalculations(), [headVersionNumber, reloadKey, resetCalculations]);

  useEffect(() => {
    const current = models.find((model) => model.key === selectedModelKey);
    if (!current) setSelectedModelKey(initialModelKey);
  }, [models, initialModelKey, selectedModelKey]);

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

  const markSaveStep = (id: string, status: "done" | "error") =>
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? {
              ...message,
              steps: message.steps?.map((step) =>
                step.id === "save" ? { ...step, status } : step,
              ),
            }
          : message,
      ),
    );

  const versionsQueryKey = [...UI_BUILDER_VERSIONS_QUERY_KEY, projectId];

  const invalidateVersions = () => queryClient.invalidateQueries({ queryKey: versionsQueryKey });

  const saveVersionMutation = useMutation({
    mutationFn: (payload: CreateUiBuilderVersionPayload) =>
      createUiBuilderVersion(projectId, payload),
    onSuccess: (created) => {
      const assistantId = activeAssistantIdRef.current;
      if (assistantId) {
        markSaveStep(assistantId, "done");
        patchMessage(assistantId, {
          text: getUiBuilderSaveAckText(created.data?.versionNumber),
          status: undefined,
        });
      }
      pendingPayloadRef.current = null;
      setPendingDraft(null);
      invalidateVersions();
    },
    onError: (error) => {
      const assistantId = activeAssistantIdRef.current;
      if (assistantId) {
        markSaveStep(assistantId, "error");
        patchMessage(assistantId, {
          text: "The page was generated but could not be saved as a version.",
          status: "error",
        });
      }
      toast.error(`The page was generated but could not be saved as a version. ${String(error)}`);
    },
  });

  const editTextMutation = useMutation({
    mutationFn: (payload: CreateUiBuilderVersionPayload) =>
      createUiBuilderVersion(projectId, payload),
    onSuccess: (created) => {
      toast.success(`Text edit saved as v${created.data?.versionNumber ?? ""}.`);
      invalidateVersions();
      setIsEditTextOpen(false);
      setSelection(null);
    },
    onError: (error) => {
      toast.error(`The text edit could not be saved. ${String(error)}`);
    },
  });

  const activeModel = models.find((model) => model.key === selectedModelKey) ?? null;
  const effectiveFormat: UiBuilderContentFormat = formatOverride ?? headFormat;

  const handleModelChange = (modelKey: string) => {
    setSelectedModelKey(modelKey);
    storeModelKey(userEmail, modelKey);
  };

  const sendPrompt = async (rawPrompt: string) => {
    const trimmedPrompt = rawPrompt.trim();
    if (!activeModel || !trimmedPrompt || isGenerating) return;

    const turnSelection = selection;
    const assistantId = crypto.randomUUID();
    const modelLabel = `${activeModel.providerLabel} · ${activeModel.modelId}`;
    activeAssistantIdRef.current = assistantId;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmedPrompt,
        selector: turnSelection?.selector,
      },
      {
        id: assistantId,
        role: "assistant",
        text: "Working on it…",
        status: "streaming",
        model: modelLabel,
      },
    ]);
    setPrompt("");
    setSelection(null);
    setSelectMode(false);
    setRuntimeError(null);
    setIsGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await agent.run({
        projectId,
        projectName: project?.name ?? "UI Builder",
        model: activeModel,
        format: effectiveFormat,
        headFormat: headVersion ? headFormat : null,
        prompt: trimmedPrompt,
        selectionBlock: turnSelection ? buildUiBuilderSelectionBlock(turnSelection) : "",
        currentHtml: headVersion?.generatedHtml ?? "",
        currentSource: headVersion?.sourceArtifact ?? "",
        dataPrompt: buildUiBuilderDataPrompt(data.contexts, effectiveFormat),
        signal: controller.signal,
        onSteps: (steps) => patchMessage(assistantId, { steps }),
      });

      if (!result.ok) {
        patchMessage(assistantId, { text: result.reason, status: "error" });
        setPendingDraft(null);
        pendingPayloadRef.current = null;
        return;
      }

      patchMessage(assistantId, {
        text:
          result.warnings.length > 0
            ? `Looks good. Saving… (${result.warnings.map((warning) => warning.detail).join(" ")})`
            : "Looks good. Saving the new version…",
      });
      setPendingDraft({
        html: result.payload.generatedHtml,
        source: result.payload.sourceArtifact ?? null,
        format: effectiveFormat,
      });
      pendingPayloadRef.current = result.payload;
      saveVersionMutation.mutate(result.payload);
    } catch (error) {
      patchMessage(assistantId, {
        text: controller.signal.aborted
          ? "Generation stopped."
          : error instanceof Error
            ? error.message
            : String(error),
        status: "error",
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                steps: message.steps?.map((step) =>
                  step.status === "running" || step.status === "pending"
                    ? { ...step, status: "skipped" }
                    : step,
                ),
              }
            : message,
        ),
      );
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => abortRef.current?.abort();

  const handleFormatChange = (nextFormat: UiBuilderContentFormat) => {
    setFormatOverride(nextFormat === headFormat ? null : nextFormat);
    setSelection(null);
    setPendingDraft(null);
    pendingPayloadRef.current = null;
  };

  const handleClearHistory = () => {
    const watermark = headVersion?.versionNumber ?? 0;
    clearedThroughVersionRef.current = watermark;
    reconciledVersionRef.current = watermark;
    clearUiBuilderChatHistory(userEmail, projectId, watermark);
    setMessages([]);
  };

  const handleSelection = useCallback(
    (nextSelection: UiBuilderSelection) => setSelection(nextSelection),
    [],
  );

  const handleRuntimeError = useCallback(
    (error: UiBuilderRuntimeError) => setRuntimeError((current) => current ?? error),
    [],
  );

  const handleSelectModeChange = (nextSelectMode: boolean) => {
    setSelectMode(nextSelectMode);
    if (!nextSelectMode) setSelection(null);
  };

  const handleConfirmEditText = (newText: string) => {
    if (!selection || !headVersion) return;

    let mutatedHtml: string;
    try {
      mutatedHtml = applyUiBuilderTextEdit(headVersion.generatedHtml, selection.selector, newText);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The selected element could not be found.",
      );
      return;
    }

    editTextMutation.mutate({
      promptText: buildUiBuilderTextEditPrompt(selection.selector, selection.textContent, newText),
      generatedHtml: mutatedHtml,
      contentFormat: headVersion.contentFormat,
      sourceArtifact: headVersion.sourceArtifact,
      provider: headVersion.provider,
      model: headVersion.model,
    });
  };

  const handleWireUp = (wirePrompt: string) => {
    setPrompt(wirePrompt);
    toast.success("Prompt ready. Review it and press Enter to wire up the data.");
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

  const previewHtml = pendingDraft?.html ?? headVersion?.generatedHtml ?? "";
  const previewSource = pendingDraft?.source ?? headVersion?.sourceArtifact ?? null;
  const previewFormat = pendingDraft?.format ?? headFormat;
  const saveFailed = saveVersionMutation.isError && pendingDraft !== null;
  const isBridgeActive = selectMode || isEditTextOpen;
  const renderHtml =
    isBridgeActive && previewHtml ? injectUiBuilderBridge(previewHtml) : previewHtml;
  const isToolbarDisabled = !previewHtml.trim() || isGenerating;
  const editTextDisabledReason =
    headFormat === "framework"
      ? "Text editing is available on HTML versions; on React, select the element and describe the change."
      : undefined;
  const currentCode = previewSource ?? previewHtml;

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={workspaceHref}
            aria-label="Back to UI Builder projects"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
            <p className="truncate text-[10px] text-slate-500">
              {headVersion ? `v${headVersion.versionNumber}` : "No versions yet"} ·{" "}
              {effectiveFormat === "framework" ? "React (live)" : "HTML"}
              {formatOverride && headVersion ? " · next turn converts the format" : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <UiBuilderCalculationsButton sections={calculations.sections} />
          <button
            type="button"
            onClick={() => setIsDataOpen(true)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-2xs font-medium transition-colors",
              data.connections.length > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700",
            )}
          >
            <Database className="h-3.5 w-3.5" />
            {data.connections.length > 0
              ? `${data.connections.length} live connection${data.connections.length === 1 ? "" : "s"}`
              : "Connect data"}
          </button>
        </div>
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        defaultLayout={initialSplit ?? undefined}
        onLayoutChanged={(layout, meta) => {
          if (meta.isUserInteraction) saveUiBuilderSplit(userEmail, projectId, layout);
        }}
        className="min-h-0 flex-1"
      >
        <ResizablePanel
          id={UI_BUILDER_CHAT_PANEL_ID}
          defaultSize={DEFAULT_CHAT_PANEL_SIZE}
          minSize={MIN_CHAT_PANEL_SIZE}
          collapsible={false}
          className="overflow-hidden border-r border-slate-200"
        >
          <UiBuilderChatPanel
            groups={groups}
            selectedModel={activeModel}
            onModelChange={handleModelChange}
            isLoading={isLoading}
            isError={isError}
            isSuccess={isSuccess}
            hasUsableModel={hasUsableModel}
            messages={messages}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSend={() => void sendPrompt(prompt)}
            onStop={handleStop}
            onClearHistory={handleClearHistory}
            onRetry={(retryPrompt) => void sendPrompt(retryPrompt)}
            isGenerating={isGenerating}
            selection={selection}
            onClearSelection={() => setSelection(null)}
            connectionCount={data.connections.length}
            onOpenData={() => setIsDataOpen(true)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="w-1 bg-transparent" />

        <ResizablePanel
          id={UI_BUILDER_PREVIEW_PANEL_ID}
          minSize={MIN_PREVIEW_PANEL_SIZE}
          collapsible={false}
          className="overflow-hidden"
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <UiBuilderPreviewToolbar
              selectMode={selectMode}
              onSelectModeChange={handleSelectModeChange}
              hasSelection={selection !== null}
              onEditText={() => selection && setIsEditTextOpen(true)}
              editTextDisabledReason={editTextDisabledReason}
              format={effectiveFormat}
              onFormatChange={handleFormatChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              device={device}
              onDeviceChange={setDevice}
              onReload={() => {
                setRuntimeError(null);
                setReloadKey((key) => key + 1);
              }}
              connectionCount={data.connections.length}
              onOpenData={() => setIsDataOpen(true)}
              disabled={isToolbarDisabled}
              isFormatLocked={isGenerating}
            />
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
            {runtimeError && viewMode === "preview" && !isGenerating && (
              <div className="flex items-start justify-between gap-3 border-b border-rose-200 bg-rose-50 px-3 py-2">
                <div className="flex min-w-0 items-start gap-2 text-2xs text-rose-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="font-semibold">The interface hit a runtime error: </span>
                    <span className="break-words">{runtimeError.message}</span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={!activeModel}
                    onClick={() =>
                      void sendPrompt(
                        `Fix this runtime error without changing anything else: ${runtimeError.message}`,
                      )
                    }
                    className="inline-flex h-6 items-center gap-1 rounded-md bg-rose-600 px-2 text-2xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    <Wand2 className="h-3 w-3" />
                    Fix with AI
                  </button>
                  <button
                    type="button"
                    aria-label="Dismiss error"
                    onClick={() => setRuntimeError(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-rose-400 hover:bg-rose-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1">
              {viewMode === "code" ? (
                <UiBuilderCodeView
                  html={previewHtml}
                  source={previewSource}
                  format={previewFormat}
                />
              ) : (
                <UiBuilderPreview
                  html={renderHtml}
                  title={project.name}
                  device={device}
                  reloadKey={reloadKey}
                  isGenerating={isGenerating}
                  bridgeEnabled={isBridgeActive}
                  onSelection={handleSelection}
                  connections={data.connections}
                  onDataRequest={data.requestData}
                  onRuntimeError={handleRuntimeError}
                  onQueryResult={calculations.record}
                />
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <UiBuilderEditTextDialog
        open={isEditTextOpen}
        selector={selection?.selector ?? ""}
        initialText={selection?.textContent ?? ""}
        isSaving={editTextMutation.isPending}
        onOpenChange={setIsEditTextOpen}
        onConfirm={handleConfirmEditText}
      />

      <UiBuilderDataPanel
        open={isDataOpen}
        onOpenChange={setIsDataOpen}
        projectId={projectId}
        projectName={project.name}
        isOwner={isOwner}
        contexts={data.contexts}
        onSave={(connections) => data.saveMutation.mutateAsync(connections)}
        isSaving={data.saveMutation.isPending}
        model={activeModel}
        currentCode={currentCode}
        onWireUp={handleWireUp}
        onDataSeeded={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
};
