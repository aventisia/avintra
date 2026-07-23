import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { useShallow } from "zustand/react/shallow";

import { supportTicketRemarksOptimisticMutationFn } from "../../apis/suport-ticket-remarks-apis";
import { SupportTicketRemarksDto } from "../../dtos/SupportTicketRemarksDto";
import { useSupportTicketsTableStore } from "../../stores/support-tickets-table-store";

interface STRemarkDeleteActionProps {
  rowId: string;
  remarkCount: number;
  setRemarkCount: (count: number) => void;
  onDelete: () => void; // Added onDelete prop
}

export const STRemarkDeleteAction = ({
  rowId,
  remarkCount,
  setRemarkCount,
  onDelete, // Destructure onDelete
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
          confirmActionFn: async () => {
            // Delete the support ticket remark
            await deleteSupportTicketRemark({
              payload: rowId,
              crudAction: "delete",
            });
            setRemarkCount(remarkCount - 1);
            onDelete(); // Call the onDelete function after deletion
          },
          alertType: "delete-record",
          additionalText: "support ticket remark",
        });
      }}
    />
  );
};
