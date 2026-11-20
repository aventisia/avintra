import { cn } from "@avplatform/ui/lib";
import { FlowArrowIcon, LightningIcon } from "@phosphor-icons/react";

import { VOICE_ENGINE_LABELS } from "../constants/voice-builder.constant";
import { type VoiceOption, VoiceOptionCards } from "./VoiceOptionCards";
import { VoiceTabHeading } from "./VoiceTabHeading";

const ENGINE_OPTIONS: VoiceOption[] = [
  {
    value: "pipeline",
    label: VOICE_ENGINE_LABELS.pipeline,
    description: "Pick a model for each stage",
    Icon: FlowArrowIcon,
  },
  {
    value: "realtime",
    label: VOICE_ENGINE_LABELS.realtime,
    description: "One model, faster replies",
    Icon: LightningIcon,
  },
];

const EngineFlow = ({ mode, isSelected }: { mode: string; isSelected: boolean }) => {
  const dot = cn("size-1.5 rounded-full", isSelected ? "bg-primary" : "bg-line-strong/60");
  const wire = cn("h-px w-2", isSelected ? "bg-primary/40" : "bg-line-strong/30");

  return (
    <span aria-hidden="true" className="flex shrink-0 items-center">
      {mode === "pipeline" ? (
        <>
          <span className={dot} />
          <span className={wire} />
          <span className={dot} />
          <span className={wire} />
          <span className={dot} />
        </>
      ) : (
        <span className={dot} />
      )}
    </span>
  );
};

type VoiceEngineModePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Engine tab header: one option card per engine, with a glyph of the stages it runs. */
export const VoiceEngineModePicker = ({ value, onChange }: VoiceEngineModePickerProps) => (
  <VoiceOptionCards
    legend={<VoiceTabHeading label="Engine" title="How the agent hears, thinks, and speaks" />}
    value={value}
    options={ENGINE_OPTIONS}
    onChange={onChange}
    renderTrailing={(mode, isSelected) => <EngineFlow mode={mode} isSelected={isSelected} />}
  />
);
