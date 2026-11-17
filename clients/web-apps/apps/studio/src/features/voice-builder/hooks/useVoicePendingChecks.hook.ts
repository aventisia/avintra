import { useMemo } from "react";

import { findVoiceAgentInputs } from "@/features/react-flow/utils/voice-agent-graph.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import type { NodeInputType } from "@/types/node-data-type";

import { useVoiceBuilderStore } from "../stores/voice-builder.store";
import type { VoiceReadinessCheck } from "../types/voice-builder.type";
import { getPendingVoiceChecks } from "../utils/voice-builder.util";

const toInputValues = (inputs: NodeInputType[] = []) =>
  Object.fromEntries(inputs.map((input) => [input.key, input.value]));

/** Required voice setup still unfinished: live from the open settings form, otherwise from the saved graph. */
export const useVoicePendingChecks = (): VoiceReadinessCheck[] => {
  const formChecks = useVoiceBuilderStore((state) => state.pendingChecks);
  const savedInputs = useReactFlowExtStore((state) => findVoiceAgentInputs(state.nodes));
  const savedChecks = useMemo(
    () => getPendingVoiceChecks(toInputValues(savedInputs)),
    [savedInputs],
  );
  return formChecks ?? savedChecks;
};
