import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useEffect, useRef } from "react";

import {
  UI_BUILDER_MODEL_DISABLED_REASON,
  UI_BUILDER_NO_MODEL_MESSAGE,
} from "../constants/ui-builder-models.constant";
import { type UiBuilderModelState } from "../hooks/useUiBuilderModels.hook";

/** A single turn rendered in the builder's chat transcript. */
export type UiBuilderChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status?: "streaming" | "error";
};

interface UiBuilderChatPanelProps {
  models: UiBuilderModelState[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  messages: UiBuilderChatMessage[];
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
  onStop: () => void;
  onClearHistory: () => void;
  isGenerating: boolean;
}

export const UiBuilderChatPanel = ({
  models,
  selectedModel,
  onModelChange,
  messages,
  prompt,
  onPromptChange,
  onSend,
  onStop,
  onClearHistory,
  isGenerating,
}: UiBuilderChatPanelProps) => {
  const hasAnyEnabled = models.some((model) => model.enabled);
  const selectedEnabled = models.some((model) => model.model === selectedModel && model.enabled);
  const canSend = hasAnyEnabled && selectedEnabled && prompt.trim().length > 0 && !isGenerating;

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="flex h-full flex-col border-l border-r border-slate-200 bg-slate-50">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4">
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            Model
          </label>
          <select
            value={selectedModel}
            onChange={(event) => onModelChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
          >
            {models.map((model) => (
              <option key={model.model} value={model.model} disabled={!model.enabled}>
                {model.label}
                {model.enabled ? "" : ` — ${UI_BUILDER_MODEL_DISABLED_REASON}`}
              </option>
            ))}
          </select>
        </div>

        {!hasAnyEnabled && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-2xs text-amber-700">
            {UI_BUILDER_NO_MODEL_MESSAGE}
          </p>
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
        <div className="flex justify-end">
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
          disabled={!hasAnyEnabled}
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
