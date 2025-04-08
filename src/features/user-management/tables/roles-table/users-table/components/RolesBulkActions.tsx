import { CircleOff } from "lucide-react";

import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { useQueryData } from "@/react-toolkit/hooks/useQueryData";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";

import { disableRoles } from "../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { RolesTableDto } from "../dtos/roles-table-dto";

interface RolesBulkActionsProps {
  table: Table<RolesTableDto>;
}

export function RolesBulkActions({ table }: RolesBulkActionsProps) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get roles query data
  const rolesQueryData = useQueryData<RolesTableDto>(DATA_QUERY_KEY);

  // Disable roles in query data
  const disableRolesInQueryData = (ids: string[]) => {
    return rolesQueryData?.map((role) => {
      if (role.id && ids.includes(role.id))
        return { ...role, isDisabled: true };
      return role;
    });
  };

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to disable multiple roles
  const { mutate: disableMultipleRoles } = useOptimisticMutation<
    string[],
    boolean,
    RolesTableDto
  >(disableRoles, DATA_QUERY_KEY, disableRolesInQueryData(selectedRowIds));

  // Disable selected roles handler
  const disableSelectedRolesHandler = () => {
    // Show alert dialog to confirm multiple disable
    showDefaultAlertDialog({
      confirmActionFn: () => disableMultipleRoles(selectedRowIds),
      alertType: "disable-multiple",
      additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "roles" : "role"}`,
    });
  };

  return (
    <>
      {selectedRowIds.length > 0 && (
        <DTBulkActions>
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <Button
            variant="ghost"
            size="xs"
            className="gap-2.5 text-sm tracking-wide"
            onClick={disableSelectedRolesHandler}
          >
            <CircleOff className="h-3.5 w-3.5 text-[--icon-color]" />
            Disable
          </Button>
        </DTBulkActions>
      )}
    </>
  );
}
