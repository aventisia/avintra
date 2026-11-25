import { useUserSessionStore } from "@avplatform/ui/stores";
import { isCommunityDeployment } from "@avplatform/ui/utils";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useChatAgentPromptMutation } from "../../../hooks/useChatAgentPromptMutation";
import { PromptActionButton } from "../../dcp-tabs/PromptActionButton";
import { CommunityPromptUpgradeButton } from "./CommunityPromptUpgradeButton";

type ChatAgentPromptActionProps = {
  /** The name of the prompt form field. */
  name: string;
  /** Disables the action (e.g. read-only panel). */
  disabled?: boolean;
};

/**
 * Single contextual action for the ChatAgent system prompt: generates a sample
 * when the field is empty, otherwise refines the existing prompt.
 */
const ChatAgentPromptAction = ({ name, disabled }: ChatAgentPromptActionProps) => {
  const { setValue, watch } = useFormContext();

  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { mutate, data, isPending } = useChatAgentPromptMutation();
  const isAgentHistory = useIsVersionHistoryRoute();
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );
  const isCommunity = isCommunityDeployment(userSession);

  const promptValue = (watch(name) as string | undefined) ?? "";
  const isImprove = promptValue.trim().length > 0;

  useEffect(() => {
    if (typeof data?.data === "string" && data.data.trim().length > 0) {
      setValue(name, data.data, { shouldDirty: true });
    }
  }, [data, name, setValue]);

  const handleClick = () => {
    if (isPending) return;

    mutate({
      refType: "Agent",
      promptTarget: "ChatAgentSystemPrompt",
      refId: currentFlow.versionId,
      refName: currentFlow.name,
      payload: promptValue,
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

export { ChatAgentPromptAction };
