import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import {
  UiBuilderCalculationsButton,
  type UiBuilderRuntimeError,
  stripUiBuilderRuntime,
  useUiBuilderCalculations,
} from "@avplatform/ui/ui-builder-host";
import {
  ArrowLeftIcon,
  DatabaseIcon,
  MagicWandIcon,
  SlidersHorizontalIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { createUiBuilderVersion } from "../apis/ui-builder.apis";
import {
  buildUiBuilderDataPrompt,
  buildUiBuilderDataSummary,
} from "../constants/ui-builder-data-prompt.constant";
import { type UiBuilderContentFormat } from "../constants/ui-builder-framework.constant";
import {
  UI_BUILDER_MEMORY_PROMPT_COUNT,
  buildUiBuilderAssetPrompt,
  buildUiBuilderImplementPlanPrompt,
} from "../constants/ui-builder-planning.constant";
import {
  buildUiBuilderSelectionBlock,
  buildUiBuilderTextEditPrompt,
} from "../constants/ui-builder-selection.constant";
import {
  type UiBuilderStyleGroup,
  applyUiBuilderStyleOption,
} from "../constants/ui-builder-style.constant";
import { describeUiBuilderTheme } from "../constants/ui-builder-theme.constant";
import { CreateUiBuilderVersionPayload, type UiBuilderThemeDto } from "../dtos/ui-builder-dto";
import { useUiBuilderAgent } from "../hooks/useUiBuilderAgent.hook";
import { useUiBuilderAssets } from "../hooks/useUiBuilderAssets.hook";
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
import { downloadUiBuilderHtml, downloadUiBuilderSource } from "../utils/ui-builder-export.util";
import { buildUiBuilderFrameworkDocument } from "../utils/ui-builder-framework-build.util";
import {
  UI_BUILDER_MAX_REFERENCE_IMAGES,
  type UiBuilderReferenceImage,
  prepareUiBuilderReferenceImage,
} from "../utils/ui-builder-image.util";
import {
  applyUiBuilderClassChange,
  applyUiBuilderTextChange,
  describeUiBuilderSourceTag,
  findUiBuilderSourceTag,
} from "../utils/ui-builder-source-map.util";
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
import { UiBuilderSettingsDialog } from "./UiBuilderSettingsDialog";
import { UiBuilderStylePanel } from "./UiBuilderStylePanel";

type UiBuilderWorkspaceProps = {
  projectId: string;
};

type UiBuilderStyleSession = { source: string; changes: string[] };

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
const VISUAL_REVIEW_STORAGE_PREFIX = "studio-ui-builder-visual-review";

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

const readStoredVisualReview = (userEmail: string) => {
  try {
    return localStorage.getItem(`${VISUAL_REVIEW_STORAGE_PREFIX}:${userEmail}`) !== "off";
  } catch {
    return true;
  }
};

const storeVisualReview = (userEmail: string, enabled: boolean) => {
  try {
    localStorage.setItem(`${VISUAL_REVIEW_STORAGE_PREFIX}:${userEmail}`, enabled ? "on" : "off");
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
  const projectAssets = useUiBuilderAssets(projectId);

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
  const [visualReview, setVisualReview] = useState(() => readStoredVisualReview(userEmail));
  const [referenceImages, setReferenceImages] = useState<UiBuilderReferenceImage[]>([]);
  const [planMode, setPlanMode] = useState(false);
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [styleSession, setStyleSession] = useState<UiBuilderStyleSession | null>(null);
  const [isStyleBusy, setIsStyleBusy] = useState(false);
  const pendingPayloadRef = useRef<CreateUiBuilderVersionPayload | null>(null);
  const pendingSuggestRef = useRef<{ prompt: string; outline: string } | null>(null);
  const lastGeneratedHtmlRef = useRef<string | null>(null);
  const autoFixedHtmlRef = useRef<string | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const clearedThroughVersionRef = useRef(0);
  const reconciledVersionRef = useRef(0);
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    setSelection(null);
    setFormatOverride(null);
    setStyleSession(null);
    if (headVersion?.generatedHtml !== lastGeneratedHtmlRef.current) setRuntimeError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      requestSuggestions(assistantId);
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

  const rebuildMutation = useMutation({
    mutationFn: async ({ theme }: { theme: UiBuilderThemeDto }) => {
      if (!headVersion?.sourceArtifact) throw new Error("There is no React version to rebuild.");
      const built = await buildUiBuilderFrameworkDocument(headVersion.sourceArtifact, theme);
      return createUiBuilderVersion(projectId, {
        promptText: `Theme updated: ${describeUiBuilderTheme(theme)}`,
        generatedHtml: built.html,
        contentFormat: headVersion.contentFormat,
        sourceArtifact: headVersion.sourceArtifact,
        provider: headVersion.provider,
        model: headVersion.model,
      });
    },
    onSuccess: (created) => {
      toast.success(`Theme applied as v${created.data?.versionNumber ?? ""}.`);
      invalidateVersions();
    },
    onError: (error) => toast.error(`The theme could not be applied. ${String(error)}`),
  });

  const handleThemeSaved = (theme: UiBuilderThemeDto) => {
    if (headFormat !== "framework" || !headVersion?.sourceArtifact || isGenerating) return;
    rebuildMutation.mutate({ theme });
  };

  const activeModel = models.find((model) => model.key === selectedModelKey) ?? null;

  const requestSuggestions = (assistantId: string | null) => {
    const context = pendingSuggestRef.current;
    pendingSuggestRef.current = null;
    if (!assistantId || !context || !activeModel) return;

    void agent
      .suggest({
        projectId,
        projectName: project?.name ?? "UI Builder",
        model: activeModel,
        prompt: context.prompt,
        outline: context.outline,
      })
      .then((suggestions) => {
        if (suggestions.length > 0) patchMessage(assistantId, { suggestions });
      });
  };
  const effectiveFormat: UiBuilderContentFormat = formatOverride ?? headFormat;

  const styleBaseSource = styleSession?.source ?? headVersion?.sourceArtifact ?? "";
  const selectedTag = useMemo(
    () =>
      selection?.sourceId && styleBaseSource
        ? findUiBuilderSourceTag(styleBaseSource, selection.sourceId)
        : null,
    [selection?.sourceId, styleBaseSource],
  );

  const saveFrameworkSourceVersion = async (source: string, promptText: string) => {
    if (!headVersion) throw new Error("There is no version to edit.");
    const built = await buildUiBuilderFrameworkDocument(source, project?.theme);
    return createUiBuilderVersion(projectId, {
      promptText,
      generatedHtml: built.html,
      contentFormat: "framework",
      sourceArtifact: source,
      provider: headVersion.provider,
      model: headVersion.model,
    });
  };

  const styleSaveMutation = useMutation({
    mutationFn: (session: UiBuilderStyleSession) =>
      saveFrameworkSourceVersion(
        session.source,
        `Style edit: ${session.changes.join("; ")}`.slice(0, 1000),
      ),
    onSuccess: (created) => {
      toast.success(`Style changes saved as v${created.data?.versionNumber ?? ""}.`);
      setStyleSession(null);
      setPendingDraft(null);
      invalidateVersions();
    },
    onError: (error) => toast.error(`The style changes could not be saved. ${String(error)}`),
  });

  const handleStyleChange = async (group: UiBuilderStyleGroup, value: string | null) => {
    if (!selection?.sourceId || !selectedTag) return;
    setIsStyleBusy(true);
    try {
      const nextSource = applyUiBuilderClassChange(styleBaseSource, selection.sourceId, (classes) =>
        applyUiBuilderStyleOption(classes, group, value),
      );
      const built = await buildUiBuilderFrameworkDocument(nextSource, project?.theme);
      setPendingDraft({ html: built.html, source: nextSource, format: "framework" });
      setStyleSession((current) => ({
        source: nextSource,
        changes: [
          ...(current?.changes ?? []),
          `<${selectedTag.name}> ${group.label.toLowerCase()} ${value ?? "default"}`,
        ],
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsStyleBusy(false);
    }
  };

  const handleStyleDiscard = () => {
    setStyleSession(null);
    setPendingDraft(null);
  };

  const handleVisualReviewChange = (enabled: boolean) => {
    setVisualReview(enabled);
    storeVisualReview(userEmail, enabled);
  };

  const handleModelChange = (modelKey: string) => {
    setSelectedModelKey(modelKey);
    storeModelKey(userEmail, modelKey);
  };

  const handleAddImages = async (files: File[]) => {
    const room = UI_BUILDER_MAX_REFERENCE_IMAGES - referenceImages.length;
    if (files.length > room) {
      toast.warning(`Up to ${UI_BUILDER_MAX_REFERENCE_IMAGES} reference images can be attached.`);
    }
    try {
      const prepared = await Promise.all(files.slice(0, room).map(prepareUiBuilderReferenceImage));
      setReferenceImages((current) =>
        [...current, ...prepared].slice(0, UI_BUILDER_MAX_REFERENCE_IMAGES),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The image could not be read.");
    }
  };

  const sendDiscussion = async (
    message: string,
    images: UiBuilderReferenceImage[],
    recentPrompts: string[],
  ) => {
    if (!activeModel) return;
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: message,
        imageThumbnails: images.length > 0 ? images.map((image) => image.thumbnail) : undefined,
      },
      {
        id: assistantId,
        role: "assistant",
        text: "Thinking…",
        status: "streaming",
        kind: "discussion",
        model: `${activeModel.providerLabel} · ${activeModel.modelId}`,
      },
    ]);
    setPrompt("");
    setReferenceImages([]);
    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const reply = await agent.discuss({
        projectId,
        projectName: project?.name ?? "UI Builder",
        model: activeModel,
        message,
        source:
          headVersion?.sourceArtifact ??
          (headVersion ? stripUiBuilderRuntime(headVersion.generatedHtml) : ""),
        outline: "",
        dataPrompt: buildUiBuilderDataPrompt(data.contexts, effectiveFormat),
        instructions: project?.instructions ?? "",
        recentPrompts,
        images: images.map((image) => image.dataUrl),
        signal: controller.signal,
        onText: (text) => patchMessage(assistantId, { text }),
      });
      patchMessage(assistantId, { text: reply.trim() || "No reply.", status: undefined });
    } catch (error) {
      patchMessage(assistantId, {
        text: controller.signal.aborted
          ? "Stopped."
          : error instanceof Error
            ? error.message
            : String(error),
        status: "error",
      });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const sendPrompt = async (
    rawPrompt: string,
    options: { withImages?: boolean; forceBuild?: boolean } = {},
  ) => {
    const turnImages = options.withImages ? referenceImages : [];
    const trimmedPrompt =
      rawPrompt.trim() ||
      (turnImages.length > 0 ? "Build this interface from the attached reference image." : "");
    if (!activeModel || !trimmedPrompt || isGenerating) return;
    if (styleSession) {
      toast.warning("Save or discard your style changes before sending a prompt.");
      return;
    }

    const turnSelection = selection;
    const recentPrompts = messages
      .filter((message) => message.role === "user")
      .slice(-UI_BUILDER_MEMORY_PROMPT_COUNT)
      .map((message) => message.text);
    if (planMode && !options.forceBuild) {
      await sendDiscussion(trimmedPrompt, turnImages, recentPrompts);
      return;
    }
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
        imageThumbnails:
          turnImages.length > 0 ? turnImages.map((image) => image.thumbnail) : undefined,
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
    if (options.withImages) setReferenceImages([]);
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
        selectionBlock: turnSelection
          ? buildUiBuilderSelectionBlock({
              ...turnSelection,
              sourceTag:
                turnSelection.sourceId && headVersion?.sourceArtifact
                  ? (() => {
                      const tag = findUiBuilderSourceTag(
                        headVersion.sourceArtifact,
                        turnSelection.sourceId,
                      );
                      return tag
                        ? describeUiBuilderSourceTag(headVersion.sourceArtifact, tag)
                        : undefined;
                    })()
                  : undefined,
            })
          : "",
        currentHtml: headVersion?.generatedHtml ?? "",
        currentSource: headVersion?.sourceArtifact ?? "",
        dataPrompt: buildUiBuilderDataPrompt(data.contexts, effectiveFormat),
        dataSummary: buildUiBuilderDataSummary(data.contexts),
        instructions: project?.instructions ?? "",
        recentPrompts,
        theme: project?.theme ?? null,
        visualReview: visualReview && effectiveFormat === "framework",
        images: turnImages.map((image) => image.dataUrl),
        assets: projectAssets.assetMap,
        assetPrompt: buildUiBuilderAssetPrompt(
          projectAssets.assets,
          effectiveFormat === "framework",
        ),
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
      pendingSuggestRef.current = { prompt: trimmedPrompt, outline: result.outline };
      lastGeneratedHtmlRef.current = result.payload.generatedHtml;
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

  const headHtml = headVersion?.generatedHtml;
  useEffect(() => {
    if (!runtimeError || isGenerating || saveVersionMutation.isPending || !activeModel) return;
    if (!headHtml || headHtml !== lastGeneratedHtmlRef.current) return;
    if (autoFixedHtmlRef.current === headHtml) return;
    autoFixedHtmlRef.current = headHtml;
    void sendPrompt(
      `Automatic fix: the live preview hit this runtime error. Fix it without changing anything else: ${runtimeError.message}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeError, isGenerating, saveVersionMutation.isPending, headHtml]);

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

    if (headFormat === "framework") {
      if (!selection.sourceId || !headVersion.sourceArtifact) return;
      let nextSource: string;
      try {
        nextSource = applyUiBuilderTextChange(
          headVersion.sourceArtifact,
          selection.sourceId,
          newText,
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : String(error));
        return;
      }
      frameworkTextMutation.mutate({
        source: nextSource,
        promptText: buildUiBuilderTextEditPrompt(
          selectedTag ? `<${selectedTag.name}>` : selection.selector,
          selection.textContent,
          newText,
        ),
      });
      return;
    }

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

  const frameworkTextMutation = useMutation({
    mutationFn: ({ source, promptText }: { source: string; promptText: string }) =>
      saveFrameworkSourceVersion(source, promptText),
    onSuccess: (created) => {
      toast.success(`Text edit saved as v${created.data?.versionNumber ?? ""}.`);
      invalidateVersions();
      setIsEditTextOpen(false);
      setSelection(null);
    },
    onError: (error) => toast.error(`The text edit could not be saved. ${String(error)}`),
  });

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
    headFormat !== "framework"
      ? undefined
      : !selection?.sourceId
        ? "Select an element inside the interface to edit its text."
        : !selectedTag?.text
          ? "This element's text is computed in code; describe the change in the chat."
          : styleSession
            ? "Save or discard your style changes first."
            : undefined;
  const styleDisabledReason =
    headFormat !== "framework"
      ? "Styling is available on React versions."
      : selection && !selection.sourceId
        ? "This element cannot be traced to the source; describe the change in the chat."
        : undefined;
  const showStylePanel =
    isStyleOpen && headFormat === "framework" && (isBridgeActive || styleSession !== null);
  const currentCode = previewSource ?? previewHtml;
  const compareVersions = versions
    .filter((version) => version !== headVersion || pendingDraft !== null)
    .filter((version) => version.contentFormat === previewFormat)
    .map((version) => ({
      versionNumber: version.versionNumber,
      label: version.label,
      code:
        version.contentFormat === "framework"
          ? (version.sourceArtifact ?? "")
          : stripUiBuilderRuntime(version.generatedHtml),
    }));

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={workspaceHref}
            aria-label="Back to UI Builder projects"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
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
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-2xs font-medium transition-colors",
                project.instructions
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700",
              )}
            >
              <SlidersHorizontalIcon className="h-3.5 w-3.5" />
              Settings
            </button>
          )}
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
            <DatabaseIcon className="h-3.5 w-3.5" />
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
            onSend={() => void sendPrompt(prompt, { withImages: true })}
            onStop={handleStop}
            onClearHistory={handleClearHistory}
            onRetry={(retryPrompt) => void sendPrompt(retryPrompt)}
            isGenerating={isGenerating}
            selection={selection}
            onClearSelection={() => setSelection(null)}
            connectionCount={data.connections.length}
            onOpenData={() => setIsDataOpen(true)}
            visualReview={visualReview}
            onVisualReviewChange={handleVisualReviewChange}
            isVisualReviewAvailable={effectiveFormat === "framework"}
            planMode={planMode}
            onPlanModeChange={setPlanMode}
            onBuildPlan={(plan) => {
              setPlanMode(false);
              void sendPrompt(buildUiBuilderImplementPlanPrompt(plan), { forceBuild: true });
            }}
            images={referenceImages}
            onAddImages={(files) => void handleAddImages(files)}
            onRemoveImage={(index) =>
              setReferenceImages((current) => current.filter((_, position) => position !== index))
            }
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
              onStyle={() => {
                setIsStyleOpen((open) => !open);
                setSelectMode(true);
              }}
              styleDisabledReason={styleDisabledReason}
              isStyleOpen={isStyleOpen}
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
                  <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
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
                    <MagicWandIcon className="h-3 w-3" />
                    Fix with AI
                  </button>
                  <button
                    type="button"
                    aria-label="Dismiss error"
                    onClick={() => setRuntimeError(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-rose-400 hover:bg-rose-100"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            <div className="relative min-h-0 flex-1">
              {showStylePanel && viewMode === "preview" && (
                <UiBuilderStylePanel
                  tagName={selectedTag?.name ?? ""}
                  classes={
                    selectedTag
                      ? selectedTag.hasClassName && !selectedTag.className
                        ? null
                        : (selectedTag.className?.value.split(/\s+/).filter(Boolean) ?? [])
                      : []
                  }
                  pendingChanges={styleSession?.changes.length ?? 0}
                  isBusy={isStyleBusy || styleSaveMutation.isPending || isGenerating}
                  onChange={(group, value) => void handleStyleChange(group, value)}
                  onSave={() => styleSession && styleSaveMutation.mutate(styleSession)}
                  onDiscard={handleStyleDiscard}
                  onClose={() => setIsStyleOpen(false)}
                />
              )}
              {viewMode === "code" ? (
                <UiBuilderCodeView
                  html={previewHtml}
                  source={previewSource}
                  format={previewFormat}
                  compareVersions={compareVersions}
                  onDownloadHtml={() =>
                    downloadUiBuilderHtml(
                      project.name,
                      pendingDraft ? undefined : headVersion?.versionNumber,
                      previewHtml,
                      projectAssets.assetMap,
                    )
                  }
                  onDownloadSource={() =>
                    previewSource &&
                    downloadUiBuilderSource(
                      project.name,
                      pendingDraft ? undefined : headVersion?.versionNumber,
                      previewSource,
                    )
                  }
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
                  assets={projectAssets.assetMap}
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
        isSaving={editTextMutation.isPending || frameworkTextMutation.isPending}
        onOpenChange={setIsEditTextOpen}
        onConfirm={handleConfirmEditText}
      />

      <UiBuilderSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        projectId={projectId}
        project={project}
        onThemeSaved={handleThemeSaved}
        assets={projectAssets}
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
