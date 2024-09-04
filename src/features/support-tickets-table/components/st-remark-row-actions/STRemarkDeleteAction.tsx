import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { useSupportTicketsTableStore } from "../../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";

interface STRemarkDeleteActionProps {
  rowId: string;
  remarkCount: number;
  setRemarkCount: (count: number) => void;
}

export const STRemarkDeleteAction = ({
  rowId,
  remarkCount,
  setRemarkCount,
}: STRemarkDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get remarks query key
  const { remarksQueryKey } = useSupportTicketsTableStore(
    useShallow((state) => ({
      remarksQueryKey: [state.remarksQueryKey] as unknown as string[], // Update the type to be a string array
    })),
  );

  // Get mutation function to delete the support ticket remark
  const { mutate: deleteSupportTicketRemark } = useListOptimisticMutation<
    string,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >([rowId], supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => {
            // Delete the support ticket remark
            deleteSupportTicketRemark({
              payload: rowId,
              crudAction: "delete",
            });
            setRemarkCount(remarkCount - 1);
          },
          alertType: "delete-record",
          additionalText: "support ticket remark",
        });
      }}
    />
  );
};
