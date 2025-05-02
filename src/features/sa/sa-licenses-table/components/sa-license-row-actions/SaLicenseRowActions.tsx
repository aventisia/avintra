import { LicenseCreditStatusesEnum } from "@/react-toolkit/enums/license-credit-status-enum";

import { DataTableRowActions } from "@aventisia/ui/data-table";

import { ApproveRowAction } from "./ApproveRowAction";
import { RecordPaymentRowAction } from "./RecordPaymentRowAction";

interface SaLicenseRowActionsProps {
  rowId: string;

  status: LicenseCreditStatusesEnum;
}

export const SaLicenseRowActions = ({ rowId }: SaLicenseRowActionsProps) => {
  return (
    // Dropdown menu for license table row action */}
    <DataTableRowActions>
      <RecordPaymentRowAction rowId={rowId} />
      <ApproveRowAction rowId={rowId} />
      {/* {status === LicenseCreditStatusesEnum.Requested ? (
      ) : null} */}
    </DataTableRowActions>
  );
};
