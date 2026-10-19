import { Button } from "@avplatform/ui/buttons";
import { type ModelProviderEnum } from "@avplatform/ui/enums";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { createUiBuilderVersion } from "../apis/ui-builder.apis";
import {
  UI_BUILDER_FRAMEWORK_SELECTION_NOTE,
  UI_BUILDER_FRAMEWORK_SKILL_NAMES,
  UI_BUILDER_FRAMEWORK_SYSTEM_PROMPT,
  type UiBuilderContentFormat,
  buildUiBuilderFixPrompt,
  buildUiBuilderFrameworkUserContent,
} from "../constants/ui-builder-framework.constant";
import { type UiBuilderGenerationModel } from "../constants/ui-builder-models.constant";
import {
  buildUiBuilderSelectionBlock,
  buildUiBuilderTextEditPrompt,
} from "../constants/ui-builder-selection.constant";
import { CreateUiBuilderVersionPayload } from "../dtos/ui-builder-dto";
import { useUiBuilderGeneration } from "../hooks/useUiBuilderGeneration.hook";
import { useUiBuilderModels } from "../hooks/useUiBuilderModels.hook";
import {
  UI_BUILDER_VERSIONS_QUERY_KEY,
  useUiBuilderProject,
} from "../hooks/useUiBuilderProject.hook";
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
import { buildUiBuilderFrameworkDocument } from "../utils/ui-builder-framework-build.util";
import { validateUiBuilderFramework } from "../utils/ui-builder-framework-validate.util";
import {
  UI_BUILDER_CHAT_PANEL_ID,
  UI_BUILDER_PREVIEW_PANEL_ID,
  getUiBuilderSplit,
  saveUiBuilderSplit,
} from "../utils/ui-builder-split-persistence.util";
import { type UiBuilderChatMessage, UiBuilderChatPanel } from "./UiBuilderChatPanel";
import { UiBuilderCodeView } from "./UiBuilderCodeView";
import { UiBuilderEditTextDialog } from "./UiBuilderEditTextDialog";
import { UiBuilderPreview } from "./UiBuilderPreview";
import { UiBuilderPreviewToolbar } from "./UiBuilderPreviewToolbar";

type UiBuilderWorkspaceProps = {
  projectId: string;
};

type UiBuilderPendingDraft = {
  html: string;
  source: string | null;
  format: UiBuilderContentFormat;
};

const workspaceHref = `${import.meta.env.VITE_WORKSPACE_PATH}ui-builder`;

const DEFAULT_CHAT_PANEL_SIZE = 320;
const MIN_CHAT_PANEL_SIZE = 320;
const MIN_PREVIEW_PANEL_SIZE = 256;

const normalizeUiBuilderFormat = (value?: string): UiBuilderContentFormat =>
  value === "framework" ? "framework" : "html";

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
  const { providers, models, initialModelKey, isLoading, isError, isSuccess } =
    useUiBuilderModels();
  const { generate, generateSource } = useUiBuilderGeneration();

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
  const headVersionNumber = headVersion?.versionNumber;
  const headFormat = normalizeUiBuilderFormat(headVersion?.contentFormat);

  const [selectedModelKey, setSelectedModelKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<UiBuilderChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<UiBuilderPendingDraft | null>(null);
  const [formatOverride, setFormatOverride] = useState<UiBuilderContentFormat | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selection, setSelection] = useState<UiBuilderSelection | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
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
  }, [headVersionNumber]);

  useEffect(() => {
    const isAvailable = models.some((model) => model.key === selectedModelKey);
    if (!isAvailable) setSelectedModelKey(initialModelKey);
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
      setPendingDraft(null);
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

  const editTextMutation = useMutation({
    mutationFn: (payload: CreateUiBuilderVersionPayload) =>
      createUiBuilderVersion(projectId, payload),
    onSuccess: (created) => {
      const versionNumber = created.data?.versionNumber;
      toast.success(`Text edit saved as v${versionNumber ?? ""}.`);
      invalidateVersions();
      setIsEditTextOpen(false);
      setSelection(null);
    },
    onError: (error) => {
      toast.error(`The text edit could not be saved. ${String(error)}`);
    },
  });

  const activeModel = models.find((model) => model.key === selectedModelKey) ?? null;
  const selectedProviderType = activeModel?.providerType ?? "";

  const handleProviderChange = (providerType: ModelProviderEnum) => {
    const firstModel = models.find((model) => model.providerType === providerType);
    setSelectedModelKey(firstModel?.key ?? "");
  };

  const runFrameworkGeneration = async (
    assistantId: string,
    trimmedPrompt: string,
    activeModelOption: UiBuilderGenerationModel,
    selectionBlock: string,
    controller: AbortController,
  ) => {
    const requestBase = {
      projectId,
      projectName: project?.name ?? "UI Builder",
      model: activeModelOption,
      skillNames: [...UI_BUILDER_FRAMEWORK_SKILL_NAMES],
      signal: controller.signal,
    };

    let streamedCharacters = 0;
    const source = await generateSource({
      ...requestBase,
      systemPrompt: UI_BUILDER_FRAMEWORK_SYSTEM_PROMPT,
      userContent: buildUiBuilderFrameworkUserContent(
        headVersion?.sourceArtifact ?? "",
        trimmedPrompt,
        selectionBlock ? `${selectionBlock}\n\n${UI_BUILDER_FRAMEWORK_SELECTION_NOTE}` : "",
      ),
      onDelta: (delta) => {
        streamedCharacters += delta.length;
        patchMessage(assistantId, {
          text: `Drafting the interface… ${streamedCharacters.toLocaleString()} characters`,
        });
      },
    });

    let finalSource = source;
    let violations = validateUiBuilderFramework(source);

    if (violations.length > 0) {
      patchMessage(assistantId, {
        text: `Checking quality… ${violations.length} issue(s) found.`,
      });

      const fixId = crypto.randomUUID();
      activeAssistantIdRef.current = fixId;
      setMessages((prev) => [
        ...prev,
        {
          id: fixId,
          role: "assistant",
          text: `Fixing ${violations.length} issues…`,
          status: "streaming",
        },
      ]);

      let fixCharacters = 0;
      finalSource = await generateSource({
        ...requestBase,
        systemPrompt: UI_BUILDER_FRAMEWORK_SYSTEM_PROMPT,
        userContent: buildUiBuilderFixPrompt(trimmedPrompt, source, violations),
        onDelta: (delta) => {
          fixCharacters += delta.length;
          patchMessage(fixId, {
            text: `Fixing ${violations.length} issues… ${fixCharacters.toLocaleString()} characters`,
          });
        },
      });

      violations = validateUiBuilderFramework(finalSource);
      if (violations.length > 0) {
        const codes = [...new Set(violations.map((violation) => violation.code))].join(", ");
        patchMessage(fixId, {
          text: `Quality check failed (${violations.length} issues): ${codes}. Nothing was saved — adjust the prompt and send again.`,
          status: "error",
        });
        setPendingDraft(null);
        pendingPayloadRef.current = null;
        return;
      }

      patchMessage(fixId, { text: "Quality check passed. Saving version…" });
    } else {
      patchMessage(assistantId, { text: "Quality check passed. Saving version…" });
    }

    const builtHtml = buildUiBuilderFrameworkDocument(finalSource);
    const payload: CreateUiBuilderVersionPayload = {
      promptText: trimmedPrompt,
      generatedHtml: builtHtml,
      contentFormat: "framework",
      sourceArtifact: finalSource,
      provider: activeModelOption.provider,
      model: activeModelOption.model,
    };

    setPendingDraft({ html: builtHtml, source: finalSource, format: "framework" });
    pendingPayloadRef.current = payload;
    saveVersionMutation.mutate(payload);
  };

  const runHtmlGeneration = async (
    assistantId: string,
    trimmedPrompt: string,
    activeModelOption: UiBuilderGenerationModel,
    llmPrompt: string,
    controller: AbortController,
  ) => {
    let streamedCharacters = 0;
    const html = await generate({
      projectId,
      projectName: project?.name ?? "UI Builder",
      model: activeModelOption,
      prompt: llmPrompt,
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
      contentFormat: "html",
      provider: activeModelOption.provider,
      model: activeModelOption.model,
    };

    setPendingDraft({ html, source: null, format: "html" });
    pendingPayloadRef.current = payload;
    patchMessage(assistantId, { text: "Generation complete. Saving version…" });
    saveVersionMutation.mutate(payload);
  };

  const handleSend = async () => {
    const trimmedPrompt = prompt.trim();
    if (!activeModel?.wireProvider || !trimmedPrompt || isGenerating) return;

    const generationModel: UiBuilderGenerationModel = {
      provider: activeModel.wireProvider,
      model: activeModel.modelId,
    };

    const effectiveFormat: UiBuilderContentFormat = formatOverride ?? headFormat;
    const selectionBlock = selection ? buildUiBuilderSelectionBlock(selection) : "";
    const llmPrompt = selectionBlock ? `${trimmedPrompt}\n\n${selectionBlock}` : trimmedPrompt;

    const assistantId = crypto.randomUUID();
    activeAssistantIdRef.current = assistantId;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmedPrompt },
      {
        id: assistantId,
        role: "assistant",
        text:
          effectiveFormat === "framework" ? "Drafting the interface…" : "Generating the interface…",
        status: "streaming",
      },
    ]);
    setPrompt("");
    setSelection(null);
    setIsGenerating(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (effectiveFormat === "framework") {
        await runFrameworkGeneration(
          assistantId,
          trimmedPrompt,
          generationModel,
          selectionBlock,
          controller,
        );
      } else {
        await runHtmlGeneration(assistantId, trimmedPrompt, generationModel, llmPrompt, controller);
      }
    } catch (error) {
      const failedId = activeAssistantIdRef.current ?? assistantId;
      if (controller.signal.aborted) {
        patchMessage(failedId, { text: "Generation stopped.", status: "error" });
      } else {
        patchMessage(failedId, {
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

  const handleSelectModeChange = (nextSelectMode: boolean) => {
    setSelectMode(nextSelectMode);
    if (!nextSelectMode) setSelection(null);
  };

  const handleEditText = () => {
    if (selection) setIsEditTextOpen(true);
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
    headFormat === "framework" ? "Manual text edit is not available on React versions." : undefined;

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
            providers={providers}
            selectedProviderType={selectedProviderType}
            onProviderChange={handleProviderChange}
            models={models}
            selectedModelKey={selectedModelKey}
            onModelChange={setSelectedModelKey}
            isLoading={isLoading}
            isError={isError}
            isSuccess={isSuccess}
            messages={messages}
            prompt={prompt}
            onPromptChange={setPrompt}
            onSend={handleSend}
            onStop={handleStop}
            onClearHistory={handleClearHistory}
            isGenerating={isGenerating}
            selection={selection}
            onClearSelection={() => setSelection(null)}
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
            <UiBuilderPreviewToolbar
              selectMode={selectMode}
              onSelectModeChange={handleSelectModeChange}
              hasSelection={selection !== null}
              onEditText={handleEditText}
              editTextDisabledReason={editTextDisabledReason}
              format={formatOverride ?? headFormat}
              onFormatChange={handleFormatChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              disabled={isToolbarDisabled}
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
                  bridgeEnabled={isBridgeActive}
                  onSelection={handleSelection}
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
    </div>
  );
};
