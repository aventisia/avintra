import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import CustomCheckbox from "@/components/CustomCheckbox";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { UiBuilderSearchUsers } from "./UiBuilderSearchUsers";
import UiBuilderUsersList from "./UiBuilderUsersList";

type CachedProject = Pick<UiBuilderTableDto, "id" | "isPublishedTenantWide">;

export type AssignUiBuilderUsersDialogProps = {
  open: boolean;
  onClose: () => void;
  uiBuilderProjectId: string;
  /** Returns the cached project-list query keys searched for the project's tenant-wide flag; must be referentially stable. */
  getProjectsQueryKeys: (spaceId: string | undefined) => QueryKey[];
};

/**
 * Renders the dialog that assigns users (or all team members) to a UI builder project.
 */
export const AssignUiBuilderUsersDialog = ({
  open,
  onClose,
  uiBuilderProjectId,
  getProjectsQueryKeys,
}: AssignUiBuilderUsersDialogProps) => {
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
      const project = getProjectsQueryKeys(currentSpace?.id)
        .flatMap(
          (queryKey) => queryClient.getQueryData<{ data: CachedProject[] }>(queryKey)?.data ?? [],
        )
        .find((item) => item.id === uiBuilderProjectId);

      const isAssignedToAll = !!project?.isPublishedTenantWide;

      setAssignAll(isAssignedToAll);
      setSavedAssignAll(isAssignedToAll);
    }
  }, [open, uiBuilderProjectId, queryClient, currentSpace?.id, getProjectsQueryKeys]);

  return (
    <Dialog
      open={open}
      onOpenChange={(openValue: boolean) => {
        if (!openValue) onClose();
      }}
    >
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
            uiBuilderProjectId={uiBuilderProjectId}
            assignAll={assignAll}
            savedAssignAll={savedAssignAll}
            onUpdateSuccess={(newValue) => setSavedAssignAll(newValue)}
          />

          {!savedAssignAll && (
            <>
              <p className="text-md font-semibold px-4 mt-2">Assigned User(s)</p>
              <div className="p-2 px-4 pb-4">
                <UiBuilderUsersList uiBuilderProjectId={uiBuilderProjectId} />
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
