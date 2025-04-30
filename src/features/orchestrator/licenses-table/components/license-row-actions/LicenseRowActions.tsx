import { DataTableRowActions } from "@aventisia/ui/data-table";

import { LicenseRowCancelAction } from "./LicenseRowCancelAction";

interface LicenseRowActionsProps {
  rowId: string;
}

export const LicenseRowActions = ({ rowId }: LicenseRowActionsProps) => {
  return (
    // Dropdown menu for license table row action */}
    <DataTableRowActions>
      {/* View the license details */}
      <LicenseRowCancelAction rowId={rowId} />
    </DataTableRowActions>
  );
};
