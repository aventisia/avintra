import { DataTableRowActions } from '@/react-toolkit/ui/data-table/row-actions/DataTableRowActions';
import { DTRowAction } from '@/react-toolkit/ui/data-table/row-actions/DTRowAction';

interface SaLicenseRowActionsProps {
  rowId: string;
}

export const SaLicenseRowActions = ({ rowId }: SaLicenseRowActionsProps) => {
  return (
    // Dropdown menu for license table row action */}
    <DataTableRowActions>
      {/* View the license details */}
      <DTRowAction rowId={rowId} crudAction="read" />
    </DataTableRowActions>
  );
};
