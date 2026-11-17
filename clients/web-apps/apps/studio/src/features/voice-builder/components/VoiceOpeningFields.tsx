import { RobotIcon, UserIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { VOICE_FIELDS } from "../constants/voice-builder.constant";
import { type VoiceOption, VoiceOptionCards } from "./VoiceOptionCards";

const SPEAKER_OPTIONS: VoiceOption[] = [
  {
    value: "human",
    label: "Caller speaks first",
    description: "Agent waits for the caller",
    Icon: UserIcon,
  },
  {
    value: "ai",
    label: "Agent speaks first",
    description: "Agent greets with the introduction",
    Icon: RobotIcon,
  },
];

type VoiceOpeningFieldsProps = {
  renderField: (name: string) => ReactNode;
};

/** Who speaks first, and the introduction when the agent does. */
export const VoiceOpeningFields = ({ renderField }: VoiceOpeningFieldsProps) => {
  const { watch, setValue } = useFormContext();
  const firstSpeaker = (watch(VOICE_FIELDS.firstSpeaker) as string | undefined) ?? "human";

  return (
    <>
      <VoiceOptionCards
        legend={<span className="text-hint font-semibold text-ink-2">Who speaks first</span>}
        value={firstSpeaker}
        options={SPEAKER_OPTIONS}
        onChange={(value) => setValue(VOICE_FIELDS.firstSpeaker, value, { shouldDirty: true })}
      />

      {firstSpeaker === "ai" && renderField(VOICE_FIELDS.introduction)}
    </>
  );
};
