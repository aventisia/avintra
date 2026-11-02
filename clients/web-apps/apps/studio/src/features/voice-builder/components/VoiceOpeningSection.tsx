import { cn } from "@avplatform/ui/lib";
import { Bot, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceBuilderSection } from "./VoiceBuilderSection";

const SPEAKER_OPTIONS = [
  {
    value: "human",
    label: "Caller speaks first",
    description: "The agent waits for the caller to say something.",
    Icon: UserRound,
  },
  {
    value: "ai",
    label: "Agent speaks first",
    description: "The agent greets the caller with the introduction below.",
    Icon: Bot,
  },
];

type VoiceOpeningSectionProps = {
  renderField: (name: string) => ReactNode;
};

export const VoiceOpeningSection = ({ renderField }: VoiceOpeningSectionProps) => {
  const { watch, setValue } = useFormContext();
  const firstSpeaker = (watch(VOICE_FIELDS.firstSpeaker) as string | undefined) ?? "human";

  return (
    <VoiceBuilderSection
      id="opening"
      title="Opening"
      description="Who talks first when a call connects."
    >
      <div role="radiogroup" aria-label="Who speaks first" className="grid gap-2 sm:grid-cols-2">
        {SPEAKER_OPTIONS.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={firstSpeaker === value}
            onClick={() => setValue(VOICE_FIELDS.firstSpeaker, value, { shouldDirty: true })}
            className={cn(
              "flex items-start gap-3 rounded-lg border border-line px-3 py-3 text-left hover:bg-hover focus-visible:shadow-focus focus-visible:outline-none",
              firstSpeaker === value && "border-primary bg-selected hover:bg-selected",
            )}
          >
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-2" />
            <span>
              <span className="block text-body-sm font-semibold text-ink">{label}</span>
              <span className="block text-hint text-muted-foreground">{description}</span>
            </span>
          </button>
        ))}
      </div>

      {firstSpeaker === "ai" && renderField(VOICE_FIELDS.introduction)}
    </VoiceBuilderSection>
  );
};
