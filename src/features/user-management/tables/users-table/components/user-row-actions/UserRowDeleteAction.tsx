import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";

import { userOptimisticMutationFn } from "../../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { UsersTableDto } from "../../dtos/users-table-dto";

interface UserRowDeleteActionProps {
  rowId: string;
}

export const UserRowDeleteAction = ({ rowId }: UserRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the User
  const { mutate: deleteUser } = useListOptimisticMutation<
    string,
    UsersTableDto | boolean,
    UsersTableDto
  >([rowId], userOptimisticMutationFn, DATA_QUERY_KEY);

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
