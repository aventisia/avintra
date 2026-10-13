import { Textarea } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { SendIcon } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";

import { FLOW_ASSISTANT_COPY, FLOW_ASSISTANT_MODEL_OPTIONS } from "../constants";
import { useFlowAssistant } from "../hooks/useFlowAssistant";
import { useFlowAssistantReferenceData } from "../hooks/useFlowAssistantReferenceData.hook";
import { useFlowAssistantStore } from "../stores/flow-assistant-store";
import { FlowAssistantMessageList } from "./FlowAssistantMessageList";
import { GraphProposalCard } from "./GraphProposalCard";

export const FlowAssistantPanel = () => {
  const { sendMessage, cancel } = useFlowAssistant();
  useFlowAssistantReferenceData();
  const isStreaming = useFlowAssistantStore((state) => state.isStreaming);
  const pendingProposal = useFlowAssistantStore((state) => state.pendingProposal);
  const selectedModelId = useFlowAssistantStore((state) => state.selectedModelId);
  const setSelectedModelId = useFlowAssistantStore((state) => state.setSelectedModelId);
  const [input, setInput] = useState("");

  const selectedModel = FLOW_ASSISTANT_MODEL_OPTIONS.find(
    (option) => option.id === selectedModelId,
  );

  useEffect(() => () => cancel(), [cancel]);

  const submit = () => {
    const value = input.trim();
    if (!value || isStreaming) return;
    setInput("");
    void sendMessage(value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex items-start justify-between gap-2 border-b px-3 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {FLOW_ASSISTANT_COPY.panelTitle}
          </h2>
          <p className="text-3xs text-muted-foreground">{FLOW_ASSISTANT_COPY.panelDescription}</p>
        </div>
        <Select value={selectedModelId} onValueChange={setSelectedModelId} disabled={isStreaming}>
          <SelectTrigger size="xs" className="w-40 shrink-0" aria-label="Assistant model">
            <SelectValue>{selectedModel?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FLOW_ASSISTANT_MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id} size="xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <FlowAssistantMessageList />

      {pendingProposal && (
        <div className="px-3 pb-2">
          <GraphProposalCard proposal={pendingProposal} />
        </div>
      )}

      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={FLOW_ASSISTANT_COPY.composerPlaceholder}
            disabled={isStreaming}
            size="sm"
            rows={2}
            className="min-h-[64px] resize-none"
          />
          <Button
            type="submit"
            size="icon8"
            disabled={isStreaming || input.trim().length === 0}
            aria-label="Send message"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
