import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler, useTableRowOptimisticMutation } from "@avplatform/ui/hooks";

import { deleteApiKey } from "../../apis/api-key.apis";
import { DATA_QUERY_KEY } from "../../constants";
import type { ApiKeyDto } from "../../dtos/api-key.dto";

interface ApiKeyRowDeleteActionProps {
  rowId: string;
}

export const ApiKeyRowDeleteAction = ({ rowId }: ApiKeyRowDeleteActionProps) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate } = useTableRowOptimisticMutation<string, boolean, ApiKeyDto>(
    "delete",
    [rowId],
    deleteApiKey,
    DATA_QUERY_KEY,
  );

  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => mutate(rowId),
          alertType: "delete-record",
          additionalText: "API key",
        });
      }}
    />
  );
};
