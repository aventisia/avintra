import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { useQueryData } from "@/react-toolkit/hooks/useQueryData";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DTBulkActions } from "@/react-toolkit/ui/data-table/bulk-actions/DTBulkActions";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";
import { CircleOff } from "lucide-react";
import { disablePricingPlans } from "../../apis/pricingPlans-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { PricingPlansTableDto } from "../../dtos/pricingPlans-table-dto";

interface PricingPlansBulkActionsProps {
  table: Table<PricingPlansTableDto>;
}

export function PricingPlansBulkActions({
  table,
}: Readonly<PricingPlansBulkActionsProps>) {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get pricingplans query data
  const pricingplansQueryData =
    useQueryData<PricingPlansTableDto>(DATA_QUERY_KEY);

  // Disable pricingplans in query data
  const disablePricingPlansInQueryData = (ids: string[]) => {
    return pricingplansQueryData?.map((pricingplan) => {
      if (pricingplan.id && ids.includes(pricingplan.id))
        return { ...pricingplan, isDisabled: true };
      return pricingplan;
    });
  };

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)
    .filter((id): id is string => id !== undefined);

  // Get mutation function to disable multiple pricingplans
  const { mutate: disableMultiplePricingPlans } = useOptimisticMutation<
    string[],
    boolean,
    PricingPlansTableDto
  >(
    disablePricingPlans,
    DATA_QUERY_KEY,
    disablePricingPlansInQueryData(selectedRowIds),
  );

  // Disable selected pricingplans handler
  const disableSelectedPricingPlansHandler = () => {
    // Show alert dialog to confirm multiple disable
    showDefaultAlertDialog({
      confirmActionFn: () => disableMultiplePricingPlans(selectedRowIds),
      alertType: "disable-multiple",
      additionalText: `${selectedRowIds.length} ${selectedRowIds.length > 1 ? "pricingplans" : "pricingplan"}`,
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
            onClick={disableSelectedPricingPlansHandler}
          >
            <CircleOff className="h-3.5 w-3.5 text-[--icon-color]" />
            Disable
          </Button>
        </DTBulkActions>
      )}
    </>
  );
}
