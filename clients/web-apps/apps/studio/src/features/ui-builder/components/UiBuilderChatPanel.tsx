import { Alert } from "@avplatform/ui/alert";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import {
  ArrowUp,
  Bot,
  Check,
  Circle,
  Database,
  Eye,
  EyeOff,
  Hammer,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Loader2,
  MessagesSquare,
  MousePointer2,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import {
  UI_BUILDER_MODELS_LOAD_FAILED_MESSAGE,
  UI_BUILDER_NO_MODEL_MESSAGE,
} from "../constants/ui-builder-models.constant";
import {
  type UiBuilderModelState,
  type UiBuilderProviderGroup,
} from "../hooks/useUiBuilderModels.hook";
import { type UiBuilderChatMessage, type UiBuilderChatStep } from "../types/ui-builder-chat.type";
import { type UiBuilderSelection } from "../types/ui-builder-selection.type";
import {
  UI_BUILDER_MAX_REFERENCE_IMAGES,
  type UiBuilderReferenceImage,
} from "../utils/ui-builder-image.util";
import { UiBuilderModelPicker } from "./UiBuilderModelPicker";

type UiBuilderStarter = { icon: ReactNode; title: string; prompt: string };

const STARTERS: UiBuilderStarter[] = [
  {
    icon: <Inbox className="h-4 w-4" />,
    title: "Agent review inbox",
    prompt:
      "A review inbox for work items an AI agent has processed: a filterable list with status chips, a detail panel showing the extracted fields, and Approve / Reject actions with a comment box.",
  },
  {
    icon: <ListChecks className="h-4 w-4" />,
    title: "Intake form",
    prompt:
      "A multi-step intake form that captures a customer request (contact details, request type, description, priority, due date), validates every step, and shows a confirmation summary.",
  },
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    title: "Operations dashboard",
    prompt:
      "An operations dashboard with KPI cards (pending, in progress, completed, failed), a throughput trend, and a table of the latest work items with search and status filters.",
  },
];

type UiBuilderChatPanelProps = {
  groups: UiBuilderProviderGroup[];
  selectedModel: UiBuilderModelState | null;
  onModelChange: (modelKey: string) => void;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  hasUsableModel: boolean;
  messages: UiBuilderChatMessage[];
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
  onStop: () => void;
  onClearHistory: () => void;
  onRetry?: (prompt: string) => void;
  isGenerating: boolean;
  selection?: UiBuilderSelection | null;
  onClearSelection?: () => void;
  connectionCount: number;
  onOpenData: () => void;
  visualReview: boolean;
  onVisualReviewChange: (enabled: boolean) => void;
  isVisualReviewAvailable: boolean;
  planMode: boolean;
  onPlanModeChange: (enabled: boolean) => void;
  onBuildPlan: (plan: string) => void;
  images: UiBuilderReferenceImage[];
  onAddImages: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
};

const StepIcon = ({ status }: { status: UiBuilderChatStep["status"] }) => {
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />;
  if (status === "done") return <Check className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "error") return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
  return <Circle className="h-3 w-3 text-slate-300" />;
};

const StepTimeline = ({ steps }: { steps: UiBuilderChatStep[] }) => (
  <ol className="mt-2 space-y-1.5 border-l border-slate-200 pl-3">
    {steps
      .filter((step) => step.status !== "skipped")
      .map((step) => (
        <li key={step.id} className="relative flex items-start gap-2 text-2xs">
          <span className="absolute -left-[19px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white">
            <StepIcon status={step.status} />
          </span>
          <span
            className={cn(
              "font-medium",
              step.status === "pending" ? "text-slate-400" : "text-slate-700",
            )}
          >
            {step.label}
          </span>
          {step.detail && <span className="truncate text-slate-400">· {step.detail}</span>}
        </li>
      ))}
  </ol>
);

const SuggestionChips = ({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (prompt: string) => void;
}) => (
  <div className="mt-2 flex flex-wrap gap-1.5 pl-1" aria-label="Suggested next steps">
    {suggestions.map((suggestion) => (
      <button
        key={suggestion}
        type="button"
        onClick={() => onPick(suggestion)}
        className="inline-flex max-w-full items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/60 px-2.5 py-1 text-left text-[10px] font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
      >
        <Sparkles className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate">{suggestion}</span>
      </button>
    ))}
  </div>
);

const AssistantMessage = ({
  message,
  onRetry,
  retryPrompt,
  onPickSuggestion,
  onBuildPlan,
}: {
  message: UiBuilderChatMessage;
  onRetry?: (prompt: string) => void;
  retryPrompt?: string;
  onPickSuggestion?: (prompt: string) => void;
  onBuildPlan?: (plan: string) => void;
}) => (
  <div className="flex gap-2.5">
    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-sm">
      <Bot className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 flex-1">
      <div
        className={cn(
          "rounded-xl rounded-tl-sm border px-3 py-2 text-xs leading-relaxed shadow-sm",
          message.status === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-slate-200 bg-white text-slate-700",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        {message.steps && message.steps.length > 0 && <StepTimeline steps={message.steps} />}
      </div>
      <div className="mt-1 flex items-center gap-2 pl-1 text-[10px] text-slate-400">
        {message.model && <span className="truncate">{message.model}</span>}
        {message.kind === "discussion" && !message.status && onBuildPlan && (
          <button
            type="button"
            onClick={() => onBuildPlan(message.text)}
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
          >
            <Hammer className="h-2.5 w-2.5" />
            Build this
          </button>
        )}
        {message.status === "error" && retryPrompt && onRetry && (
          <button
            type="button"
            onClick={() => onRetry(retryPrompt)}
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Retry
          </button>
        )}
      </div>
      {onPickSuggestion && message.suggestions && message.suggestions.length > 0 && (
        <SuggestionChips suggestions={message.suggestions} onPick={onPickSuggestion} />
      )}
    </div>
  </div>
);

const UserMessage = ({ message }: { message: UiBuilderChatMessage }) => (
  <div className="flex justify-end">
    <div className="max-w-[88%] rounded-xl rounded-tr-sm bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white shadow-sm">
      {message.imageThumbnails && message.imageThumbnails.length > 0 && (
        <div className="mb-1.5 flex gap-1">
          {message.imageThumbnails.map((thumbnail, index) => (
            <img
              key={index}
              src={thumbnail}
              alt={`Reference image ${index + 1}`}
              className="h-12 w-12 rounded-md object-cover ring-1 ring-white/20"
            />
          ))}
        </div>
      )}
      {message.selector && (
        <span className="mb-1 inline-flex max-w-full items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-200">
          <MousePointer2 className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{message.selector}</span>
        </span>
      )}
      <p className="whitespace-pre-wrap break-words">{message.text}</p>
    </div>
  </div>
);

const EmptyState = ({ onPick }: { onPick: (prompt: string) => void }) => (
  <div className="flex flex-1 flex-col justify-center gap-5 py-6">
    <div className="space-y-2 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20">
        <Bot className="h-5 w-5" />
      </div>
      <h2 className="text-sm font-semibold text-slate-900">What should we build?</h2>
      <p className="mx-auto max-w-[260px] text-2xs leading-relaxed text-slate-500">
        Describe an interface for your agents and people. Connect it to a queue to work with live
        data.
      </p>
    </div>
    <div className="space-y-2">
      {STARTERS.map((starter) => (
        <button
          key={starter.title}
          type="button"
          onClick={() => onPick(starter.prompt)}
          className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            {starter.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-slate-800">{starter.title}</span>
            <span className="line-clamp-2 text-2xs leading-relaxed text-slate-500">
              {starter.prompt}
            </span>
          </span>
        </button>
      ))}
    </div>
  </div>
);

/** Left-hand agent panel: transcript with step timelines, model picker, and composer. */
export const UiBuilderChatPanel = ({
  groups,
  selectedModel,
  onModelChange,
  isLoading,
  isError,
  isSuccess,
  hasUsableModel,
  messages,
  prompt,
  onPromptChange,
  onSend,
  onStop,
  onClearHistory,
  onRetry,
  isGenerating,
  selection,
  onClearSelection,
  connectionCount,
  onOpenData,
  visualReview,
  onVisualReviewChange,
  isVisualReviewAvailable,
  planMode,
  onPlanModeChange,
  onBuildPlan,
  images,
  onAddImages,
  onRemoveImage,
}: UiBuilderChatPanelProps) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend =
    Boolean(selectedModel) && (prompt.trim().length > 0 || images.length > 0) && !isGenerating;
  const canAttach = images.length < UI_BUILDER_MAX_REFERENCE_IMAGES && !isGenerating;

  const takeImageFiles = (files: Iterable<File>) => {
    const imageFiles = [...files].filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) onAddImages(imageFiles);
    return imageFiles.length > 0;
  };
  const showNoModels = isSuccess && groups.length === 0;

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [prompt]);

  useEffect(() => {
    if (!isConfirmingClear) return;
    const timeout = window.setTimeout(() => setIsConfirmingClear(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [isConfirmingClear]);

  const promptBefore = (index: number) => {
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      if (messages[cursor].role === "user") return messages[cursor].text;
    }
    return undefined;
  };

  const pickStarter = (starterPrompt: string) => {
    onPromptChange(starterPrompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isGenerating && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                isGenerating ? "bg-indigo-500" : "bg-emerald-500",
              )}
            />
          </span>
          <span className="text-xs font-semibold text-slate-800">Builder agent</span>
          <span className="text-2xs text-slate-400">{isGenerating ? "working…" : "ready"}</span>
        </div>
        {messages.length > 0 && (
          <Tooltip content={isConfirmingClear ? "Click again to clear" : "Clear chat history"}>
            <button
              type="button"
              aria-label="Clear chat history"
              disabled={isGenerating}
              onClick={() => {
                if (isConfirmingClear) {
                  setIsConfirmingClear(false);
                  onClearHistory();
                } else setIsConfirmingClear(true);
              }}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-md px-2 text-2xs font-medium transition-colors disabled:opacity-50",
                isConfirmingClear
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isConfirmingClear && "Confirm"}
            </button>
          </Tooltip>
        )}
      </div>

      <div
        ref={messagesRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={pickStarter} />
        ) : (
          messages.map((message, index) =>
            message.role === "user" ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <AssistantMessage
                key={message.id}
                message={message}
                onRetry={isGenerating ? undefined : onRetry}
                retryPrompt={promptBefore(index)}
                onPickSuggestion={
                  !isGenerating && index === messages.length - 1 ? pickStarter : undefined
                }
                onBuildPlan={isGenerating ? undefined : onBuildPlan}
              />
            ),
          )
        )}
      </div>

      <div className="space-y-2 px-3 pb-3">
        {isError && (
          <Alert
            variant="warning"
            title="Models unavailable"
            description={UI_BUILDER_MODELS_LOAD_FAILED_MESSAGE}
          />
        )}
        {showNoModels && (
          <Alert
            variant="warning"
            title="No models available"
            description={UI_BUILDER_NO_MODEL_MESSAGE}
          />
        )}

        <div
          onDragOver={(event) => {
            if (!canAttach || !event.dataTransfer.types.includes("Files")) return;
            event.preventDefault();
            setIsDraggingImage(true);
          }}
          onDragLeave={() => setIsDraggingImage(false)}
          onDrop={(event) => {
            setIsDraggingImage(false);
            if (!canAttach) return;
            if (takeImageFiles(event.dataTransfer.files)) event.preventDefault();
          }}
          className={cn(
            "rounded-2xl border bg-white shadow-sm transition-all focus-within:border-indigo-300 focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10",
            isGenerating ? "border-indigo-200" : "border-slate-200",
            isDraggingImage && "border-indigo-400 ring-4 ring-indigo-500/15",
          )}
        >
          {images.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
              {images.map((image, index) => (
                <span key={`${image.name}-${index}`} className="group relative">
                  <img
                    src={image.thumbnail}
                    alt={image.name}
                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${image.name}`}
                    onClick={() => onRemoveImage(index)}
                    disabled={isGenerating}
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white shadow"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {selection && (
            <div className="flex items-center gap-1 px-3 pt-2.5">
              <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700 ring-1 ring-indigo-200">
                <MousePointer2 className="h-3 w-3 shrink-0" />
                <span className="min-w-0 truncate">Editing {selection.selector}</span>
                <button
                  type="button"
                  aria-label="Clear selection"
                  onClick={onClearSelection}
                  className="ml-0.5 shrink-0 rounded p-0.5 hover:bg-indigo-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={prompt}
            rows={2}
            onChange={(event) => onPromptChange(event.target.value)}
            onPaste={(event) => {
              if (!canAttach) return;
              if (takeImageFiles(event.clipboardData.files)) event.preventDefault();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                if (canSend) onSend();
              }
            }}
            placeholder={
              planMode
                ? "Ask a question or discuss a change — nothing is built in plan mode…"
                : selection
                  ? "Describe the change to the selected element…"
                  : messages.length === 0
                    ? "Describe the interface you want to build…"
                    : "Ask for a change, a new section, or a fix…"
            }
            aria-label="Prompt"
            className="block max-h-[200px] min-h-[56px] w-full resize-none bg-transparent px-3 pt-3 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            disabled={!hasUsableModel}
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                  if (event.target.files) takeImageFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <Tooltip content="Attach a screenshot or mockup (or paste / drop one)">
                <button
                  type="button"
                  aria-label="Attach reference image"
                  disabled={!canAttach}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <UiBuilderModelPicker
                groups={groups}
                selectedModel={selectedModel}
                onSelect={onModelChange}
                isLoading={isLoading}
                disabled={isGenerating}
              />
              <Tooltip content="Data connections">
                <button
                  type="button"
                  onClick={onOpenData}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-2xs font-medium shadow-sm transition-colors",
                    connectionCount > 0
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700",
                  )}
                >
                  <Database className="h-3 w-3" />
                  {connectionCount > 0 ? connectionCount : "Data"}
                </button>
              </Tooltip>
              <Tooltip
                content={
                  planMode
                    ? "Plan mode on: the agent discusses and plans without changing the interface"
                    : "Plan mode: discuss before building"
                }
              >
                <button
                  type="button"
                  aria-pressed={planMode}
                  aria-label="Plan mode"
                  disabled={isGenerating}
                  onClick={() => onPlanModeChange(!planMode)}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-2xs font-medium shadow-sm transition-colors disabled:opacity-50",
                    planMode
                      ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-700",
                  )}
                >
                  <MessagesSquare className="h-3 w-3" />
                  Plan
                </button>
              </Tooltip>
              {isVisualReviewAvailable && !planMode && (
                <Tooltip
                  content={
                    visualReview
                      ? "Visual check on: screenshots are reviewed and broken layouts fixed (uses more tokens)"
                      : "Visual check off"
                  }
                >
                  <button
                    type="button"
                    aria-pressed={visualReview}
                    aria-label="Visual check"
                    disabled={isGenerating}
                    onClick={() => onVisualReviewChange(!visualReview)}
                    className={cn(
                      "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-2xs font-medium shadow-sm transition-colors disabled:opacity-50",
                      visualReview
                        ? "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-700",
                    )}
                  >
                    {visualReview ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Visual
                  </button>
                </Tooltip>
              )}
            </div>
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-transform hover:scale-105"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                aria-label="Send prompt"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-105 disabled:scale-100 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <p className="px-1 text-center text-[10px] text-slate-400">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
};

export type { UiBuilderChatMessage };
