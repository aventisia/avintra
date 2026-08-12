import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Edge, Node, Viewport, getIncomers } from "@xyflow/react";
import { RocketIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import { LoadFlowDto } from "../react-flow/dtos/load-flow-dto";
import { usePublishFlowMutation } from "../react-flow/hooks/usePublishFlow";
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

  const { mutate: publish, isPending } = usePublishFlowMutation();
  const { showCustomAlertDialog } = useShowAlertHandler();

  const handlePublish = () => {
    if (!flowId || !versionId) return;

    publish({
      flowId,
      id: versionId,
      isPublished: true,
    });
  };

  const validateAiSequence = (nodes: Node[], edges: Edge[]) => {
    // Find the flowEndNode in the current nodes array
    const endNode = nodes.find((n) => n.type === "flowEndNode");

    if (!endNode) return false;

    // Use the inbuilt utility to get all nodes pointing TO the endNode
    // This replaces manual edge filtering and node searching
    const precedingNodes = getIncomers(endNode, nodes, edges);

    // Return true if any of those incoming nodes are 'aiNode'
    return precedingNodes.some((node) => node.type === "aiNode");
  };

  const isDisabled = !flowData || flowData.isPublished || isPending;

  const type = flowData?.type?.replace(/([a-z])([A-Z])/g, "$1 $2");

  return (
    <Button
      variant="default"
      size="sm"
      disabled={isDisabled}
      className=" items-center justify-start gap-2 "
      onClick={() => {
        if (!flowData) return;
        if (flowData?.type == FlowTypesEnum.ChatAgent) {
          // Parse flow JSON safely
          const flow = deepParse(flowData.reactFlowObject) as unknown as {
            nodes: Node[];
            edges: Edge[];
            viewport: Viewport;
          };

          const isValidChatFlow = validateAiSequence(flow.nodes, flow.edges);

          if (!isValidChatFlow) {
            toast.warning("Chat agent must end with an AI Node.");
            return;
          }
        }
        showCustomAlertDialog({
          confirmActionFn: handlePublish,
          confirmBtnText: "Publish",
          title: `Publish ${type ?? ""}`,
          description: `Are you sure you want to publish the ${type?.toLowerCase() ?? "flow"}?`,
          isDestructive: false,
        });
      }}
    >
      {isPending ? (
        <LoadingSpinner className="h-4 w-4 shrink-0" />
      ) : (
        <RocketIcon className="h-4 w-4 shrink-0" />
      )}
        <span className="text-sm font-bold">Publish</span>
    </Button>
  );
};

export { PublishFlow };
