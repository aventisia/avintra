import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent } from "@avplatform/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { UI_BUILDER_QUERY_KEY } from "../../constants";
import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { useUpdateUiBuilderMutation } from "../../hooks/useUpdateUiBuilderMutation";
import { useDisableUiBuilderStore } from "../../stores/disable-ui-builder-store";

const UiBuilderDisableDialog = () => {
  const queryClient = useQueryClient();

  const { open, setOpen, uiBuilderProjectId } = useDisableUiBuilderStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const space = currentSpace?.id ?? "";
  const cachedProjects = [
    queryClient.getQueryData<{ data: UiBuilderTableDto[] }>([...UI_BUILDER_QUERY_KEY, space]),
    queryClient.getQueryData<{ data: UiBuilderTableDto[] }>([
      ...UI_BUILDER_QUERY_KEY,
      "SHARED",
      space,
    ]),
  ];
  const project = cachedProjects
    .flatMap((cached) => cached?.data ?? [])
    .find((item) => item.id === uiBuilderProjectId);

  const { isPending, mutate } = useUpdateUiBuilderMutation();

  const handleDisable = () => {
    if (project) {
      mutate({ ...project, isDisabled: true }, { onSettled: () => setOpen(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(openValue: boolean) => setOpen(openValue)}>
      <DialogContent className="space-y-6 p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Disable {project?.name}?</h2>
          <p className="text-sm text-muted-foreground">
            It will be hidden from Published and shared users will lose access. Sharing is kept and
            restored on Enable.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={isPending || !project} onClick={handleDisable}>
            {isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
            Disable
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UiBuilderDisableDialog;
