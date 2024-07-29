import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { tenantOptimisticMutationFn } from "../../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
import { TenantsTableDto } from "../../dtos/tenants-table-dto";

interface TenantRowDeleteActionProps {
  rowId: string;
}

export const TenantRowDeleteAction = ({
  rowId,
}: TenantRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultDeleteAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the tenant
  const { mutate: deleteTenant } = useListOptimisticMutation<
    string,
    TenantsTableDto | boolean,
    TenantsTableDto
  >(tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultDeleteAlertDialog(
          {
            confirmActionFn: () => {
              // Delete the tenant
              deleteTenant({
                id: rowId,
                payload: rowId,
                crudAction: "delete",
              });
            },
          },
          "tenant",
        );
      }}
    />
  );
};
