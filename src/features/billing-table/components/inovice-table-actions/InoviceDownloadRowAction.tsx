import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { inoviceOptimisticMutationFn } from "../../apis/inovices-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { InovicesTableDto } from "../../dtos/inovices-table-dto";
import { ButtonIcon } from "@radix-ui/react-icons";

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
    <ButtonIcon
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
    />
  );
};
