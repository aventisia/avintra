import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useChatAgentPromptMutation } from "../../../hooks/useChatAgentPromptMutation";
import { PromptActionButton } from "../../dcp-tabs/PromptActionButton";

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

  const promptValue = (watch(name) as string | undefined) ?? "";
  const isImprove = promptValue.trim().length > 0;

  // Apply the generated/refined prompt back into the form field.
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

  // Version history is read-only; hide the action there.
  if (isAgentHistory) return null;

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
