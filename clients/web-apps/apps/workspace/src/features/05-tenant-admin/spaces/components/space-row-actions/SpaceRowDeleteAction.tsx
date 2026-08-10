import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { spaceOptimisticMutationFn } from "../../apis/spaces-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { SpacesTableDto } from "../../dtos/spaces-table-dto";

interface SpaceRowDeleteActionProps {
  rowId: string;
  row: SpacesTableDto;
}

export const SpaceRowDeleteAction = ({ rowId, row }: SpaceRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the Space
  const { mutate: deleteSpace } = useListOptimisticMutation<
    string,
    SpacesTableDto | boolean,
    SpacesTableDto
  >([rowId], spaceOptimisticMutationFn, DATA_QUERY_KEY);

  // The default "Central" space cannot be deleted.
  const isDefault = row.isDefault;

  // A space with published agents cannot be deleted.
  const hasPublishedAgents = (row.totalPublishedAgents ?? 0) > 0;

  // Delete is disabled for the default space or a space with published agents.
  const isDeleteDisabled = isDefault || hasPublishedAgents;

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      disabled={isDeleteDisabled}
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteSpace({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "space",
        });
      }}
    />
  );
};
