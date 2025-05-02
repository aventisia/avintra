import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { BanIcon } from "lucide-react";

import { licenseOptimisticMutationFn } from "../../apis/licenses-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { MyLicensesTableDto } from "../../dtos/licenses-table-dto";

interface LicenseRowCancelActionProps {
  rowId: string;
}

export const LicenseRowCancelAction = ({
  rowId: id,
}: LicenseRowCancelActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the keystore
  const { mutate: cancel } = useListOptimisticMutation<
    string,
    MyLicensesTableDto | boolean,
    MyLicensesTableDto
  >([id], licenseOptimisticMutationFn, DATA_QUERY_KEY);

  // Return retry alert dialog trigger
  return (
    <SimpleDDMenuItem
      content="Cancel"
      Icon={BanIcon}
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            cancel({
              payload: id,
              crudAction: "delete",
            }),
          isDestructive: true,
          title: "Cancel the Request?",
          description: `Are you sure to cancel the requested units?`,
          confirmBtnText: "Cancel",
        });
      }}
    />
  );
};
