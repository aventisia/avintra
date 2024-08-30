import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DeleteDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/DeleteDDMenuItem";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { useSupportTicketsTableStore } from "../../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";

interface STRemarkDeleteActionProps {
  rowId: string;
}

export const STRemarkDeleteAction = ({ rowId }: STRemarkDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultDeleteAlertDialog } = useShowAlertHandler();

  // Get remarks query key
  const { remarksQueryKey } = useSupportTicketsTableStore(
    useShallow((state) => ({
      remarksQueryKey: state.remarksQueryKey,
    })),
  );

  // Get mutation function to delete the support ticket remark
  const { mutate: deleteSupportTicketRemark } = useListOptimisticMutation<
    string,
    SupportTicketRemarksDto | boolean,
    SupportTicketRemarksDto
  >(supportTicketRemarksOptimisticMutationFn, remarksQueryKey);

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultDeleteAlertDialog(
          {
            confirmActionFn: () => {
              // Delete the support ticket remark
              deleteSupportTicketRemark({
                id: rowId,
                payload: rowId,
                crudAction: "delete",
              });
            },
          },
          "support ticket remark",
        );
      }}
    />
  );
};
