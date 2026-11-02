import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { Check } from "lucide-react";

import { ModelConfigField } from "@/features/dynamic-config-panel/components/fields-for-form/ModelConfigField";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceBuilderSection } from "./VoiceBuilderSection";

const ENGINES = [
  {
    label: "Pipeline",
    description:
      "Speech-to-text, then a language model, then text-to-speech. Works with any model.",
    isAvailable: true,
  },
  {
    label: "Realtime",
    description: "One speech-to-speech model. Lower delay, fewer model choices.",
    isAvailable: false,
  },
];

export const VoiceBrainSection = () => (
  <VoiceBuilderSection
    id="brain"
    title="Brain"
    description="The engine and models that hear, think, and answer."
  >
    <div role="radiogroup" aria-label="Engine" className="grid gap-2 sm:grid-cols-2">
      {ENGINES.map((engine) => (
        <div
          key={engine.label}
          role="radio"
          aria-checked={engine.isAvailable}
          aria-disabled={!engine.isAvailable}
          className={cn(
            "rounded-lg border px-3 py-3",
            engine.isAvailable
              ? "border-primary bg-selected"
              : "border-dashed border-line text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-semibold text-ink">{engine.label}</span>
            {engine.isAvailable ? (
              <Check aria-hidden="true" className="ml-auto size-4 text-primary-text" />
            ) : (
              <Badge variant="draft" className="ml-auto">
                Phase 5
              </Badge>
            )}
          </div>
          <p className="text-hint text-muted-foreground">{engine.description}</p>
        </div>
      ))}
    </div>

    <ModelConfigField name={VOICE_FIELDS.languageModel} showJsonOutput={false} hideByok />
    <ModelConfigField
      name={VOICE_FIELDS.speechToText}
      specialty="stt"
      showJsonOutput={false}
      hideByok
    />
  </VoiceBuilderSection>
);
