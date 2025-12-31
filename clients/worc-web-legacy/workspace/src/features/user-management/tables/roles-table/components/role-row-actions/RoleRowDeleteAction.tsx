import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";
import {
  useListOptimisticMutation,
  useShowAlertHandler,
} from "@aventisia/ui/hooks";

import { roleOptimisticMutationFn } from "../../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { RoleTableDTO } from "../../dtos/roles-table-dto";

interface RoleRowDeleteActionProps {
  rowId: string;
}

export const RoleRowDeleteAction = ({ rowId }: RoleRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the User
  const { mutate: deleteUser } = useListOptimisticMutation<
    string,
    RoleTableDTO | boolean,
    RoleTableDTO
  >([rowId], roleOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteUser({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "user",
        });
      }}
    />
  );
};
