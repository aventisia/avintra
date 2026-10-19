import { Alert } from "@avplatform/ui/alert";
import { Button } from "@avplatform/ui/buttons";
import { type ModelProviderEnum } from "@avplatform/ui/enums";
import { cn } from "@avplatform/ui/lib";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  UI_BUILDER_MODELS_LOADING_MESSAGE,
  UI_BUILDER_MODELS_LOAD_FAILED_MESSAGE,
  UI_BUILDER_NO_MODEL_MESSAGE,
  UI_BUILDER_NO_SUPPORTED_MODEL_MESSAGE,
  UI_BUILDER_UNSUPPORTED_MODEL_REASON,
} from "../constants/ui-builder-models.constant";
import {
  type UiBuilderModelState,
  type UiBuilderProviderState,
} from "../hooks/useUiBuilderModels.hook";
import { type UiBuilderSelection } from "../types/ui-builder-selection.type";

/** A single turn rendered in the builder's chat transcript. */
export type UiBuilderChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status?: "streaming" | "error";
};

type UiBuilderChatPanelProps = {
  providers: UiBuilderProviderState[];
  selectedProviderType: ModelProviderEnum | "";
  onProviderChange: (providerType: ModelProviderEnum) => void;
  models: UiBuilderModelState[];
  selectedModelKey: string;
  onModelChange: (modelKey: string) => void;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  messages: UiBuilderChatMessage[];
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
  onStop: () => void;
  onClearHistory: () => void;
  isGenerating: boolean;
  selection?: UiBuilderSelection | null;
  onClearSelection?: () => void;
};

export const UiBuilderChatPanel = ({
  providers,
  selectedProviderType,
  onProviderChange,
  models,
  selectedModelKey,
  onModelChange,
  isLoading,
  isError,
  isSuccess,
  messages,
  prompt,
  onPromptChange,
  onSend,
  onStop,
  onClearHistory,
  isGenerating,
  selection,
  onClearSelection,
}: UiBuilderChatPanelProps) => {
  const activeModel = models.find((model) => model.key === selectedModelKey) ?? null;
  const providerModels = models.filter((model) => model.providerType === selectedProviderType);
  const hasRoutableModel = models.some((model) => model.wireProvider !== null);
  const isResolving = isLoading || (!isSuccess && !isError);
  const showNoModels = isSuccess && models.length === 0;
  const showUnsupportedModels = isSuccess && models.length > 0 && !hasRoutableModel;
  const canSend = Boolean(activeModel?.wireProvider) && prompt.trim().length > 0 && !isGenerating;

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="flex h-full flex-col border-l border-r border-slate-200 bg-slate-50">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4">
        <div>
          <label
            htmlFor="ui-builder-provider"
            className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Model Provider
          </label>
          <select
            id="ui-builder-provider"
            value={selectedProviderType}
            onChange={(event) => onProviderChange(event.target.value as ModelProviderEnum)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={isResolving || providers.length === 0}
          >
            {providers.length === 0 && (
              <option value="">
                {isResolving ? UI_BUILDER_MODELS_LOADING_MESSAGE : "No provider available"}
              </option>
            )}
            {providers.map((provider) => (
              <option
                key={provider.providerType}
                value={provider.providerType}
                disabled={!provider.isRoutable}
              >
                {provider.label}
                {provider.isRoutable ? "" : ` — ${UI_BUILDER_UNSUPPORTED_MODEL_REASON}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ui-builder-model"
            className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Model
          </label>
          <select
            id="ui-builder-model"
            value={selectedModelKey}
            onChange={(event) => onModelChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={isResolving || providerModels.length === 0}
          >
            {providerModels.length === 0 && (
              <option value="">
                {isResolving ? UI_BUILDER_MODELS_LOADING_MESSAGE : "No model available"}
              </option>
            )}
            {providerModels.map((model) => (
              <option key={model.key} value={model.key} disabled={model.wireProvider === null}>
                {model.modelId}
                {model.wireProvider === null ? ` — ${UI_BUILDER_UNSUPPORTED_MODEL_REASON}` : ""}
              </option>
            ))}
          </select>
        </div>

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
            title="No models enabled"
            description={UI_BUILDER_NO_MODEL_MESSAGE}
          />
        )}
        {showUnsupportedModels && (
          <Alert
            variant="warning"
            title="No supported models"
            description={UI_BUILDER_NO_SUPPORTED_MODEL_MESSAGE}
          />
        )}
      </div>

      <div ref={messagesRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-2xs text-muted-foreground">
            Describe the interface you want to build, then send your first prompt.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-snug shadow-sm",
                  message.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-muted text-foreground",
                  message.status === "error" && "bg-destructive/10 text-destructive",
                )}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 p-4">
        <div
          className={cn("flex items-center gap-2", selection ? "justify-between" : "justify-end")}
        >
          {selection && (
            <span className="inline-flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-2xs text-muted-foreground">
              <span className="min-w-0 truncate">
                Selected: <span className="font-medium text-foreground">{selection.selector}</span>
              </span>
              <button
                type="button"
                aria-label="Clear selection"
                onClick={onClearSelection}
                className="shrink-0 rounded-full p-0.5 hover:bg-slate-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              if (window.confirm("Clear the chat history for this project?")) onClearHistory();
            }}
          >
            Clear history
          </Button>
        </div>
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Describe the page you want to build..."
          className="h-20 resize-none rounded-md border border-slate-200 bg-white p-2 text-sm"
          disabled={!hasRoutableModel}
        />
        {isGenerating ? (
          <Button size="sm" variant="outline" className="w-full" onClick={onStop}>
            Stop
          </Button>
        ) : (
          <Button size="sm" className="w-full" onClick={onSend} disabled={!canSend}>
            Send
          </Button>
        )}
      </div>
    </div>
  );
};
