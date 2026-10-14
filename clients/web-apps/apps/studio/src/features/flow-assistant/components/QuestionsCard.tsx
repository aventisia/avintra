import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useState } from "react";

import { useFlowAssistant } from "../hooks/useFlowAssistant";
import { useFlowAssistantStore } from "../stores/flow-assistant-store";
import { FlowAssistantQuestionSlot } from "../types/flow-assistant-question-type";

type QuestionsCardProps = {
  slots: FlowAssistantQuestionSlot[];
};

const formatAnswer = (slot: FlowAssistantQuestionSlot, value: string): string =>
  slot.nodeName ? `${slot.label} (${slot.nodeName}): ${value}` : value;

export const QuestionsCard = ({ slots }: QuestionsCardProps) => {
  const { sendMessage } = useFlowAssistant();
  const isStreaming = useFlowAssistantStore((state) => state.isStreaming);
  const [values, setValues] = useState<Record<string, string>>({});

  const setValue = (key: string, value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const canSubmit = slots.every((slot) => (values[slot.key] ?? "").trim().length > 0);

  const submit = () => {
    if (!canSubmit || isStreaming) return;
    const answer = slots
      .map((slot) => formatAnswer(slot, (values[slot.key] ?? "").trim()))
      .join("\n");
    void sendMessage(answer);
  };

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <p className="text-xs font-medium text-foreground">Values needed</p>

      <div className="mt-2 space-y-2.5">
        {slots.map((slot) => (
          <div key={`${slot.nodeName ?? ""}.${slot.key}`}>
            <p className="text-3xs font-medium text-foreground">
              {slot.label}
              {slot.nodeName && (
                <span className="font-normal text-muted-foreground"> ({slot.nodeName})</span>
              )}
            </p>
            {(slot.options ?? []).length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {(slot.options ?? []).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={values[slot.key] === option ? "default" : "outline"}
                    size="xs"
                    disabled={isStreaming}
                    onClick={() => setValue(slot.key, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
            <Input
              value={values[slot.key] ?? ""}
              onChange={(event) => setValue(slot.key, event.target.value)}
              disabled={isStreaming}
              placeholder={slot.label}
              className="mt-1 h-8 text-xs"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end">
        <Button type="button" variant="default" size="xs" disabled={!canSubmit} onClick={submit}>
          Send values
        </Button>
      </div>
    </div>
  );
};
