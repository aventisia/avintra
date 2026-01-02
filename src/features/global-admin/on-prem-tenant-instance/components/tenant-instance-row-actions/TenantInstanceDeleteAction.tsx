import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";
import { useParams } from "react-router-dom";

import { TenantInstanceOptimisticMutationFn } from "../../apis/tenant-instance-apis";
import { TENANT_INSTANCE_QUERY_KEY } from "../../constants";
import { OnPremInstanceDto } from "../../dtos/tenant-instance-dto";

interface TenantInstanceDeleteActionProps {
  rowId: string;
}

export const TenantInstanceDeleteAction = ({
  rowId,
}: TenantInstanceDeleteActionProps) => {
  const { tid = "" } = useParams();

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the tenant
  const { mutate: deleteTenantInstance } = useListOptimisticMutation<
    string,
    OnPremInstanceDto | boolean,
    OnPremInstanceDto
  >([rowId], TenantInstanceOptimisticMutationFn, [
    TENANT_INSTANCE_QUERY_KEY,
    tid,
  ]);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteTenantInstance({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "tenant instance",
        });
      }}
    />
  );
};
