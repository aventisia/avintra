import { DataTableRowActions, DTRowAction } from "@aventisia/ui/data-table";
import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

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
