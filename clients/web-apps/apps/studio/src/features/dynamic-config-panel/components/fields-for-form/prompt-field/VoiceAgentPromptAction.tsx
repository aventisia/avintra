import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { isCommunityDeployment } from "@avplatform/ui/utils";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useVoiceAgentPromptMutation } from "../../../hooks/useVoiceAgentPromptMutation";
import {
  VOICE_AGENT_GOAL_FIELD,
  VOICE_AGENT_INSTRUCTIONS_FIELD,
  VOICE_AGENT_ROLE_FIELD,
  joinVoiceAgentPromptSections,
  splitVoiceAgentPromptSections,
} from "../../../utils/voice-agent-prompt-sections.util";
import { PromptActionButton } from "../../dcp-tabs/PromptActionButton";
import { CommunityPromptUpgradeButton } from "./CommunityPromptUpgradeButton";

type VoiceAgentPromptActionProps = {
  /** Disables the action (e.g. read-only panel). */
  disabled?: boolean;
};

/**
 * Single contextual action for the VoiceAgent persona: generates a sample
 * Goal/Role/Instructions block when all fields are empty, otherwise refines them.
 */
const VoiceAgentPromptAction = ({ disabled }: VoiceAgentPromptActionProps) => {
  const { setValue, watch } = useFormContext();

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { mutate, data, isPending } = useVoiceAgentPromptMutation();
  const isAgentHistory = useIsVersionHistoryRoute();
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  const isCommunity = isCommunityDeployment(userSession);

  const goal = (watch(VOICE_AGENT_GOAL_FIELD) as string | undefined) ?? "";
  const role = (watch(VOICE_AGENT_ROLE_FIELD) as string | undefined) ?? "";
  const instructions = (watch(VOICE_AGENT_INSTRUCTIONS_FIELD) as string | undefined) ?? "";
  const isImprove = [goal, role, instructions].some((value) => value.trim().length > 0);

  useEffect(() => {
    if (typeof data?.data !== "string" || data.data.trim().length === 0) return;

    const sections = splitVoiceAgentPromptSections(data.data);

    if (!sections) {
      toast.warning("Could not read the generated sections. The fields were left unchanged.");
      return;
    }

    setValue(VOICE_AGENT_GOAL_FIELD, sections.goal, { shouldDirty: true });
    setValue(VOICE_AGENT_ROLE_FIELD, sections.role, { shouldDirty: true });
    setValue(VOICE_AGENT_INSTRUCTIONS_FIELD, sections.instructions, { shouldDirty: true });
  }, [data, setValue]);

  const handleClick = () => {
    if (isPending) return;

    mutate({
      refType: "Agent",
      promptTarget: "VoiceAgentSystemPrompt",
      refId: currentFlow.versionId,
      refName: currentFlow.name,
      payload: joinVoiceAgentPromptSections({ goal, role, instructions }),
    });
  };

  if (isAgentHistory) return null;

  if (isCommunity) {
    return disabled ? null : (
      <CommunityPromptUpgradeButton label={isImprove ? "Improve with AI" : "Generate"} />
    );
  }

  return (
    <PromptActionButton
      label={isImprove ? "Improve with AI" : "Generate"}
      loadingLabel="Generating…"
      isPending={isPending}
      disabled={disabled}
      onClick={handleClick}
    />
  );
};

export { VoiceAgentPromptAction };
