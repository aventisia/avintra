import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { useOptimisticMutation, useQueryData, useShowAlertHandler } from "@avplatform/ui/hooks";
import {
  TableCNActionBar,
  TableCNActionBarItem,
  TableCNActionBarSelection,
  TableCNActionBarSeparator,
} from "@avplatform/ui/table-cn";
import { Table } from "@tanstack/react-table";
import { CircleOff } from "lucide-react";

import { disableUsers } from "../../apis/users-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { UsersTableDto } from "../../dtos/users-table-dto";

interface UsersBulkActionsProps {
  table: Table<UsersTableDto>;
}

export function UsersBulkActions({ table }: UsersBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  // Get users query data
  const usersQueryData = useQueryData<UsersTableDto>(DATA_QUERY_KEY);

  // Disable users in query data
  const disableUsersInQueryData = (ids: string[]) => {
    return usersQueryData?.map((user) => {
      if (user.id && ids.includes(user.id)) return { ...user, isDisabled: true };
      return user;
    });
  };

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to disable multiple users
  const { mutate: disableMultipleUsers } = useOptimisticMutation<string[], boolean, UsersTableDto>(
    disableUsers,
    DATA_QUERY_KEY,
    disableUsersInQueryData(selectedRowIds),
  );

  // Disable selected users handler
  const disableSelectedUsersHandler = () => {
    // Show alert dialog to confirm multiple disable
    showDefaultAlertDialog({
      confirmActionFn: () => disableMultipleUsers(selectedRowIds),
      alertType: "disable-multiple",
      additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "users" : "user"}`,
    });
  };

  return (
    <TableCNActionBar table={table}>
      <TableCNActionBarSelection table={table} />
      <TableCNActionBarSeparator />
      <LockedActionTooltip>
        <TableCNActionBarItem
          icon={CircleOff}
          onClick={disableSelectedUsersHandler}
          disabled={locked}
        >
          Disable
        </TableCNActionBarItem>
      </LockedActionTooltip>
    </TableCNActionBar>
  );
}
