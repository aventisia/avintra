import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { deepParse } from "@avplatform/ui/utils";
import { RocketIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Edge, Node, Viewport } from "@xyflow/react";
import { useLocation } from "react-router-dom";

import { FlowActionType } from "@/features/collaboration/dtos/collaboration-dtos";
import { broadcastFlowActionEvent } from "@/features/collaboration/hooks/useCollaboration";
import { useDirtyNodeConfigGuard } from "@/features/dynamic-config-panel/hooks/useDirtyNodeConfigGuard";
import { formatPendingSections, useVoicePendingChecks } from "@/features/voice-builder";

import { LoadFlowDto } from "../react-flow/dtos/load-flow-dto";
import { usePublishFlowMutation } from "../react-flow/hooks/usePublishFlow";
import { useSaveFlow } from "../react-flow/hooks/useSaveFlow";
import { validateChatAgentGraph } from "../react-flow/utils/chat-agent-graph.util";
import {
  validateVoiceAgentConversation,
  validateVoiceAgentGraph,
} from "../react-flow/utils/voice-agent-graph.util";

const parseFlowObject = (reactFlowObject: string) =>
  deepParse(reactFlowObject) as unknown as {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };

const PublishFlow = () => {
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const flowId = params.get("f") ?? undefined;
  const versionId = params.get("v") ?? undefined;

  const queryClient = useQueryClient();

  const flowQueryKey = ["flow", flowId, versionId];
  const getCachedFlow = () => queryClient.getQueryData<{ data: LoadFlowDto }>(flowQueryKey)?.data;

  const { mutate: publish, isPending, publishLocked } = usePublishFlowMutation();
  const { saveData } = useSaveFlow();
  const { showCustomAlertDialog } = useShowAlertHandler();
  const guardDirtyNodeConfig = useDirtyNodeConfigGuard();

  const voicePendingChecks = useVoicePendingChecks();

  const flowData = getCachedFlow();
  const voiceBlocker =
    flowData?.type === FlowTypesEnum.VoiceAgent &&
    !flowData.isPublished &&
    voicePendingChecks.length > 0
      ? `Finish ${formatPendingSections(voicePendingChecks)} to publish`
      : null;
  const isDisabled =
    !flowData || flowData.isPublished || isPending || publishLocked || !!voiceBlocker;

  const handlePublish = () => {
    if (!flowId || !versionId) return;

    publish({
      flowId,
      id: versionId,
      isPublished: true,
      type: getCachedFlow()?.type,
    });
  };

  const handlePublishClick = async () => {
    try {
      if (!(await saveData())) return;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The flow could not be saved.");
      return;
    }

    const currentFlowData = getCachedFlow();
    if (!currentFlowData) return;

    if (currentFlowData.type === FlowTypesEnum.ChatAgent) {
      const flow = parseFlowObject(currentFlowData.reactFlowObject);

      const chatAgentError = validateChatAgentGraph(flow.nodes, flow.edges);

      if (chatAgentError) {
        toast.warning(chatAgentError);
        return;
      }
    }
    if (currentFlowData.type === FlowTypesEnum.VoiceAgent) {
      const flow = parseFlowObject(currentFlowData.reactFlowObject);

      const voiceAgentError =
        validateVoiceAgentGraph(flow.nodes, flow.edges) ??
        validateVoiceAgentConversation(flow.nodes);

      if (voiceAgentError) {
        toast.warning(voiceAgentError);
        return;
      }
    }

    const type = currentFlowData.type?.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Notify collaborators that publishing is in progress so they cannot publish concurrently.
    broadcastFlowActionEvent(FlowActionType.Publish);
    showCustomAlertDialog({
      confirmActionFn: handlePublish,
      confirmBtnText: "Publish",
      title: `Publish ${type ?? ""}`,
      description: `Are you sure you want to publish the ${type?.toLowerCase() ?? "flow"}?`,
      isDestructive: false,
    });
  };

  const publishButton = (
    <Button
      variant="default"
      size="sm"
      disabled={isDisabled}
      className="gap-1.5"
      onClick={() => void guardDirtyNodeConfig(handlePublishClick)}
    >
      {isPending ? (
        <LoadingSpinner className="size-3.5 shrink-0" />
      ) : (
        <RocketIcon className="size-3.5 shrink-0" />
      )}
      Publish
    </Button>
  );

  if (!voiceBlocker) return publishButton;

  return (
    <Tooltip content={voiceBlocker} side="left">
      <span
        tabIndex={0}
        className="inline-flex rounded-md focus-visible:shadow-focus focus-visible:outline-none"
      >
        {publishButton}
      </span>
    </Tooltip>
  );
};

export { PublishFlow };
