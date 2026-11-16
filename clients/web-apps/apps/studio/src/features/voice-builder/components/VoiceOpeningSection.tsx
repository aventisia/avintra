import { RobotIcon, UserIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { VoiceBuilderSection } from "./VoiceBuilderSection";
import { type VoiceOptionCard, VoiceOptionCards } from "./VoiceOptionCards";

const SPEAKER_OPTIONS: VoiceOptionCard[] = [
  {
    value: "human",
    label: "Caller speaks first",
    description: "The agent waits for the caller to say something.",
    Icon: UserIcon,
  },
  {
    value: "ai",
    label: "Agent speaks first",
    description: "The agent greets the caller with the introduction below.",
    Icon: RobotIcon,
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
      <VoiceOptionCards
        ariaLabel="Who speaks first"
        value={firstSpeaker}
        options={SPEAKER_OPTIONS}
        onChange={(value) => setValue(VOICE_FIELDS.firstSpeaker, value, { shouldDirty: true })}
      />

      {firstSpeaker === "ai" && renderField(VOICE_FIELDS.introduction)}
    </VoiceBuilderSection>
  );
};
