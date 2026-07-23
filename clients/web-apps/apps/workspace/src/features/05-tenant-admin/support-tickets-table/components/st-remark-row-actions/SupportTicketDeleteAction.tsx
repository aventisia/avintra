import { Button } from "@avplatform/ui/buttons";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { supportTicketsOptimisticMutationFn } from "../../apis/suport-tickets-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
import { SupportTicketsTableDto } from "../../dtos/SupportTicketsTableDto";

interface STRowDeleteActionProps {
  rowId: string;
}

export const SupportTicketTDeleteAction = ({ rowId }: STRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const navigate = useNavigate();

  // Get mutation function to delete the support ticket
  const { mutate: deleteSupportTicket } = useListOptimisticMutation<
    string,
    SupportTicketsTableDto | boolean,
    SupportTicketsTableDto
  >([rowId], supportTicketsOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <Button
      variant={"caution"}
      size={"sm"}
      className="group-focus:text-white"
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => {
            // Delete the support ticket
            deleteSupportTicket({
              payload: rowId,
              crudAction: "delete",
            });
            // route to the support ticket table page
            navigate("/tenant/support/tickets");
          },
          alertType: "delete-record",
          additionalText: "support ticket",
        });
      }}
    >
      <TrashIcon className="m-[2px] h-3.5 w-3.5" />
      Delete ticket
    </Button>
  );
};
