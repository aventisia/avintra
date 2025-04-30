import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";

import { tenantOptimisticMutationFn } from "../../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { TenantsTableDto } from "../../dtos/tenants-table-dto";

interface TenantRowDeleteActionProps {
  rowId: string;
}

export const TenantRowDeleteAction = ({
  rowId,
}: TenantRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the tenant
  const { mutate: deleteTenant } = useListOptimisticMutation<
    string,
    TenantsTableDto | boolean,
    TenantsTableDto
  >([rowId], tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteTenant({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "tenant",
        });
      }}
    />
  );
};
