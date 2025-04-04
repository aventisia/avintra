import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { useQueryData } from "@/react-toolkit/hooks/useQueryData";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";
import { CircleOff } from "lucide-react";
import { disableInovices } from "../../apis/inovices-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { InovicesTableDto } from "../../dtos/inovices-table-dto";

interface InovicesBulkActionsProps {
  table: Table<InovicesTableDto>;
}

export function InovicesBulkActions({
  table,
}: Readonly<InovicesBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get billingplans query data
  const billingplansQueryData = useQueryData<InovicesTableDto>(DATA_QUERY_KEY);

  // Disable billingplans in query data
  const disableBillingPlansInQueryData = (ids: string[]) => {
    return billingplansQueryData?.map((billingplan) => {
      if (billingplan.id && ids.includes(billingplan.id))
        return { ...billingplan, isDisabled: true };
      return billingplan;
    });
  };

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to disable multiple billingplans
  const { mutate: disableMultipleBillingPlans } = useOptimisticMutation<
    string[],
    boolean,
    InovicesTableDto
  >(
    disableInovices,
    DATA_QUERY_KEY,
    disableBillingPlansInQueryData(selectedRowIds),
  );

  // Disable selected billingplans handler
  const disableSelectedBillingPlansHandler = () => {
    // Show alert dialog to confirm multiple disable
    showDefaultAlertDialog({
      confirmActionFn: () => disableMultipleBillingPlans(selectedRowIds),
      alertType: "disable-multiple",
      additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "billingplans" : "billingplan"}`,
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
            onClick={disableSelectedBillingPlansHandler}
          >
            <CircleOff className="h-3.5 w-3.5 text-[--icon-color]" />
            Disable
          </Button>
        </DTBulkActions>
      )}
    </>
  );
}
