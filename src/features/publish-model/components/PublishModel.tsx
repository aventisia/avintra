import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { useLabelDataStore } from "../../label-data/stores/label-data-store";
import { usePublishModelMutation } from "../hooks/usePublishModel";
import { usePublishDialogStore } from "../stores/usePublishDialogStore";

const PublishModel = () => {
  const location = useLocation();
  const { modelId: mlModelId, modelName, versionId } = useLabelDataStore();
  const { mutate: mutatePublish, isPending } = usePublishModelMutation();
  const { isOpen, setOpen } = usePublishDialogStore();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const modelId = queryParams.get("pid") || mlModelId || "";
  const verId = queryParams.get("v") || versionId || "";

  const handlePublish = () => {
    mutatePublish({ aiProjectId: modelId, id: verId });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="p-6 max-w-md w-full space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Publish AI Model</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to publish this model `{modelName}`?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-input border shadow-sm px-4 py-2 text-sm rounded-lg font-medium"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="px-6"
              onClick={handlePublish}
              disabled={isPending}
            >
              {isPending ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublishModel;
