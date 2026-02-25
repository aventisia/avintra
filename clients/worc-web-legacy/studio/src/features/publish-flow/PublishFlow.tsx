import { usePublishFlowMutation } from "../react-flow/hooks/usePublishFlow";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { getFlowToLoad } from "../react-flow/apis/react-flow-apis";
import { RocketIcon } from "lucide-react";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";

const PublishFlow = () => {
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const flowId = queryParams.get("f") || undefined;
  const versionId = queryParams.get("v") || undefined;

  //Get flow
  const { data: flowsData } = useQuery({
    queryKey: ["flow", flowId, versionId],
    queryFn: () => getFlowToLoad(flowId || "flowId", versionId),
  });

  // Define  mutation to publish the flow
  const { mutate: mutatePublish, isPending } = usePublishFlowMutation();

  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  const handlePublish = () => {
    if (flowId && versionId) {
      mutatePublish({
        flowId: flowId,
        isPublished: true,
        id: versionId,
      });
    }
  };
  return (
    <SimpleDDMenuItem
      size="md"
      Icon={RocketIcon}
      content="Publish"
      onClick={() =>
        showCustomAlertDialog({
          confirmActionFn: () => handlePublish(),
          confirmBtnText: "Publish",
          description: `Are you sure you want to publish the ${flowsData?.data.type.toLowerCase()}?`,
          title: `Publish ${flowsData?.data.type}`,
          isDestructive: false,
        })
      }
      disabled={flowsData?.data.isPublished || isPending}
    />
  );
};

export { PublishFlow };
