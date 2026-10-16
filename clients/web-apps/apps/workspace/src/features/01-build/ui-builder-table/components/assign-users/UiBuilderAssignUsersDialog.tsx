import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import CustomCheckbox from "@/components/CustomCheckbox";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { UI_BUILDER_QUERY_KEY } from "../../constants";
import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { useUiBuilderUsersStore } from "../../stores/ui-builder-users-store";
import { UiBuilderSearchUsers } from "./UiBuilderSearchUsers";
import UiBuilderUsersList from "./UiBuilderUsersList";

const UiBuilderAssignUsersDialog = () => {
  const { open, setOpen, uiBuilderProjectId } = useUiBuilderUsersStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  const queryClient = useQueryClient();

  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const [assignAll, setAssignAll] = useState(false);
  const [savedAssignAll, setSavedAssignAll] = useState(false);

  useEffect(() => {
    if (open) {
      const space = currentSpace?.id ?? "";
      const project = [
        queryClient.getQueryData<{ data: UiBuilderTableDto[] }>([...UI_BUILDER_QUERY_KEY, space]),
        queryClient.getQueryData<{ data: UiBuilderTableDto[] }>([
          ...UI_BUILDER_QUERY_KEY,
          "SHARED",
          space,
        ]),
      ]
        .flatMap((cached) => cached?.data ?? [])
        .find((item) => item.id === uiBuilderProjectId);

      const isAssignedToAll = !!project?.isPublishedTenantWide;

      setAssignAll(isAssignedToAll);
      setSavedAssignAll(isAssignedToAll);
    }
  }, [open, uiBuilderProjectId, queryClient, currentSpace?.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[65vh]">
        <DialogDefaultHeader heading={`UI Users`} />
        <ScrollArea className="h-[calc(65vh-4rem)]">
          <div className="p-4 pb-0">
            <CustomCheckbox
              checked={assignAll}
              label="Assign to all team members"
              description="All users in this tenant will be assigned automatically"
              onCheckedChange={setAssignAll}
            />
          </div>

          <UiBuilderSearchUsers
            assignAll={assignAll}
            savedAssignAll={savedAssignAll}
            onUpdateSuccess={(newValue) => setSavedAssignAll(newValue)}
          />

          {!savedAssignAll && (
            <>
              <p className="text-md font-semibold px-4 mt-2">Assigned User(s)</p>
              <div className="p-2 px-4 pb-4">
                <UiBuilderUsersList />
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UiBuilderAssignUsersDialog;
