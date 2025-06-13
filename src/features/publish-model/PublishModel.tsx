import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useFetchModel } from "../label-data/hooks/useFetchModel";
import { useLabelDataStore } from "../label-data/stores/label-data-store";
import { usePublishModelMutation } from "../model-library-table/hooks/usePublishModel";

const PublishModel = () => {
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { mutate: mutatePublish, isPending } = usePublishModelMutation();
  const location = useLocation();
  const { modelId: mlModelId } = useLabelDataStore();
  const { data: modelData, isLoading } = useFetchModel();

  const isPublishButtonDisabled = modelData?.data?.setupStatus === "Pending";

  // Get flow id and version id from url
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const modelId = queryParams.get("mid") || mlModelId || "";

  const handlePublish = () => {
    mutatePublish(modelId);
  };

  return (
    <Button
      size={"xs"}
      onClick={() =>
        showCustomAlertDialog({
          confirmActionFn: () => handlePublish(),
          confirmBtnText: "Publish",
          description: "Are you sure you to publish this model?",
          title: "Publish Model",
        })
      }
      disabled={
        isPending ||
        modelData?.data.isPublished ||
        isLoading ||
        isPublishButtonDisabled
      }
    >
      Publish
    </Button>
  );
};

export default PublishModel;
