import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

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
