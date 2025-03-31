import { DataTableRowActions } from "@/react-toolkit/ui/data-table/row-actions/DataTableRowActions";
import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import { DropdownMenuSeparator } from "@/react-toolkit/ui/dropdown-menu";
import { PricingPlanRowDeleteAction } from "./PricingPlanRowDeleteAction";

interface PricingPlanRowActionsProps {
  rowId: string;
}

export const PricingPlanRowActions = ({
  rowId,
}: PricingPlanRowActionsProps) => {
  return (
    // Dropdown menu for pricingplan table row action */}
    <DataTableRowActions>
      {/* View the pricingplan details */}
      <DTRowAction rowId={rowId} crudAction="read" />

      {/* Edit pricingplan details */}
      <DTRowAction rowId={rowId} crudAction="update" />

      {/* DropdownMenuSeparator component */}
      <DropdownMenuSeparator />

      {/* Triggers PricingPlan delete alert dialog  */}
      <PricingPlanRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
