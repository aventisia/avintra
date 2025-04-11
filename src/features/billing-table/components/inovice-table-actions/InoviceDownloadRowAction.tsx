import { Download } from "lucide-react";

import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { Button } from "@/react-toolkit/ui/buttons/Button";

import { inoviceOptimisticMutationFn } from "../../apis/inovices-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { InovicesTableDto } from "../../dtos/inovices-table-dto";

interface InoviceDownloadRowActionProps {
  rowId: string;
}

export const InoviceDownloadRowAction = ({
  rowId,
}: InoviceDownloadRowActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the billingplan
  const { mutate: deleteBillingPlan } = useListOptimisticMutation<
    string,
    InovicesTableDto | boolean,
    InovicesTableDto
  >([rowId], inoviceOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <Button
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () =>
            deleteBillingPlan({
              payload: rowId,
              crudAction: "delete",
            }),
          alertType: "delete-record",
          additionalText: "billingplan",
        });
      }}
      size="icon5"
      variant="ghost"
    >
      <Download />
    </Button>
  );
};
