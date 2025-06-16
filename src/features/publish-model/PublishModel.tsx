import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@aventisia/ui/dialog";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { useFetchModel } from "../label-data/hooks/useFetchModel";
import { useLabelDataStore } from "../label-data/stores/label-data-store";
import { usePublishModelMutation } from "../model-library-table/hooks/usePublishModel";

const PublishModel = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { modelId: mlModelId } = useLabelDataStore();
  const { data: modelData, isLoading } = useFetchModel();
  const { mutate: mutatePublish, isPending } = usePublishModelMutation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const modelId = queryParams.get("mid") || mlModelId || "";

  const isPublishButtonDisabled =
    isPending ||
    isLoading ||
    modelData?.data?.isPublished ||
    modelData?.data?.setupStatus === "Pending";

  const handlePublish = () => {
    mutatePublish(modelId, {
      onSuccess: () => {
        setOpen(false); // Close dialog on success
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild disabled={isPublishButtonDisabled}>
          <Button size={"xs"} disabled={isPublishButtonDisabled}>
            Publish
          </Button>
        </DialogTrigger>
        <DialogContent className="p-6 max-w-md w-full space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Publish Model?</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to publish this model?
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
