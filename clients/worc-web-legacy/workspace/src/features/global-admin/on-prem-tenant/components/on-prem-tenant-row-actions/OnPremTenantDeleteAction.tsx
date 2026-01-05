import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { OnPremTenantOptimisticMutationFn } from "../../apis/on-prem-tenant-apis";
import { ON_PREM_TENANT_QUERY_KEY } from "../../constants";
import { OnPremTenantDto } from "../../dtos/on-prem-tenant-dto";

interface OnPremTenantDeleteActionProps {
  rowId: string;
}

export const OnPremTenantDeleteAction = ({
  rowId,
}: OnPremTenantDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the tenant
  const { mutate: deleteFlow } = useListOptimisticMutation<
    string,
    OnPremTenantDto | boolean,
    OnPremTenantDto
  >([rowId], OnPremTenantOptimisticMutationFn, ON_PREM_TENANT_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteFlow({
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
