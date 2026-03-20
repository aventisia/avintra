import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { RocketIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import { LoadFlowDto } from "../react-flow/dtos/load-flow-dto";
import { usePublishFlowMutation } from "../react-flow/hooks/usePublishFlow";

const PublishFlow = () => {
  const { search } = useLocation();

  // Parse params (no need for useMemo here)
  const params = new URLSearchParams(search);
  const flowId = params.get("f") ?? undefined;
  const versionId = params.get("v") ?? undefined;

  const queryClient = useQueryClient();

  // Read from cache once
  const flowQueryKey = ["flow", flowId, versionId];
  const flowData = queryClient.getQueryData<{ data: LoadFlowDto }>(
    flowQueryKey,
  )?.data;

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

  const isDisabled = !flowData || flowData.isPublished || isPending;

  return (
    <SimpleDDMenuItem
      size="md"
      Icon={RocketIcon}
      content="Publish"
      disabled={isDisabled}
      onClick={() =>
        showCustomAlertDialog({
          confirmActionFn: handlePublish,
          confirmBtnText: "Publish",
          title: `Publish ${flowData?.type ?? ""}`,
          description: `Are you sure you want to publish the ${
            flowData?.type?.toLowerCase() ?? "flow"
          }?`,
          isDestructive: false,
        })
      }
    />
  );
};

export { PublishFlow };
