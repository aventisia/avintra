import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Edge, Node, Viewport } from "@xyflow/react";
import { RocketIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import { FlowActionType } from "@/features/collaboration/dtos/collaboration-dtos";
import { broadcastFlowActionEvent } from "@/features/collaboration/hooks/useCollaboration";
import { useDirtyNodeConfigGuard } from "@/features/dynamic-config-panel/hooks/useDirtyNodeConfigGuard";

import { LoadFlowDto } from "../react-flow/dtos/load-flow-dto";
import { usePublishFlowMutation } from "../react-flow/hooks/usePublishFlow";
import { validateChatAgentGraph } from "../react-flow/utils/chat-agent-graph.util";
import { deepParse } from "../react-flow/utils/deepParse";

const PublishFlow = () => {
  const { search } = useLocation();

  // Parse params (no need for useMemo here)
  const params = new URLSearchParams(search);
  const flowId = params.get("f") ?? undefined;
  const versionId = params.get("v") ?? undefined;

  const queryClient = useQueryClient();

  // Read from cache once
  const flowQueryKey = ["flow", flowId, versionId];
  const flowData = queryClient.getQueryData<{ data: LoadFlowDto }>(flowQueryKey)?.data;

  const { mutate: publish, isPending, publishLocked } = usePublishFlowMutation();
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Flush a dirty node-config form before publishing.
  const guardDirtyNodeConfig = useDirtyNodeConfigGuard();

  const handlePublish = () => {
    if (!flowId || !versionId) return;

    publish({
      flowId,
      id: versionId,
      isPublished: true,
    });
  };

  const isDisabled = !flowData || flowData.isPublished || isPending || publishLocked;

  const type = flowData?.type?.replace(/([a-z])([A-Z])/g, "$1 $2");

  const handlePublishClick = () => {
    if (!flowData) return;
    if (flowData?.type == FlowTypesEnum.ChatAgent) {
      // Parse flow JSON safely
      const flow = deepParse(flowData.reactFlowObject) as unknown as {
        nodes: Node[];
        edges: Edge[];
        viewport: Viewport;
      };

      const chatAgentError = validateChatAgentGraph(flow.nodes, flow.edges);

      if (chatAgentError) {
        toast.warning(chatAgentError);
        return;
      }
    }
    // Notify collaborators that publishing is in progress so they can't publish
    // concurrently (their Publish button becomes disabled / banner shows).
    broadcastFlowActionEvent(FlowActionType.Publish);
    showCustomAlertDialog({
      confirmActionFn: handlePublish,
      confirmBtnText: "Publish",
      title: `Publish ${type ?? ""}`,
      description: `Are you sure you want to publish the ${type?.toLowerCase() ?? "flow"}?`,
      isDestructive: false,
    });
  };

  return (
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
};

export { PublishFlow };
