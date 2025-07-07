import { Button } from "@aventisia/ui/buttons";
import { usePublishFlowMutation } from "../react-flow/hooks/usePublishFlow";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { getFlowToLoad } from "../react-flow/apis/react-flow-apis";
import { Loader2 } from "lucide-react";
import { deepParse } from "../react-flow/utils/deepParse";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { AccessTypeEnum } from "../flow-block/constants/access-type-enum";
import { PublishTypeEnum } from "../flow-block/constants/publish-type-enum";

const PublishFlow = () => {
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const flowId = queryParams.get("f");
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
    if (flowsData?.data) {
      mutatePublish({
        flowId: flowsData?.data.id,
        isPublished: true,
        reactFlowObject: JSON.stringify(
          deepParse(flowsData?.data.reactFlowObject),
        ),
        id: flowsData?.data.versionId || "",
        accessType: AccessTypeEnum.TenantLevel,
        type: PublishTypeEnum.Agent,
      });
    }
  };
  return (
    <Button
      size={"sm"}
      className="mr-2.5"
      onClick={() =>
        showCustomAlertDialog({
          confirmActionFn: () => handlePublish(),
          confirmBtnText: "Publish",
          description: "Are you sure you want to publish the agent?",
          title: "Publish Agent",
          isDestructive: false,
        })
      }
      disabled={flowsData?.data.isPublished}
    >
      {isPending && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
      Publish
    </Button>
  );
};

export { PublishFlow };
