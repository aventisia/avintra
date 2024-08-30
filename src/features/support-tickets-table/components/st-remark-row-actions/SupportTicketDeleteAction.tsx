import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { SupportTicketsTableDto } from "../../dtos/SupportTicketsTableDto";
import { supportTicketsOptimisticMutationFn } from "../../apis/suport-tickets-table-apis";
import { DATA_QUERY_KEY } from "../../constants/constants";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface STRowDeleteActionProps {
  rowId: string;
}

export const SupportTicketTDeleteAction = ({
  rowId,
}: STRowDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultDeleteAlertDialog } = useShowAlertHandler();

  const navigate = useNavigate();

  // Get mutation function to delete the support ticket
  const { mutate: deleteSupportTicket } = useListOptimisticMutation<
    string,
    SupportTicketsTableDto | boolean,
    SupportTicketsTableDto
  >(supportTicketsOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <Button
      variant={"caution"}
      size={"sm"}
      className="group-focus:text-white"
      onClick={() => {
        showDefaultDeleteAlertDialog(
          {
            confirmActionFn: () => {
              // Delete the support ticket
              deleteSupportTicket({
                id: rowId,
                payload: rowId,
                crudAction: "delete",
              });
              // route to the support ticket table page
              navigate("/supportticket");
            },
          },
          "support ticket",
        );
      }}
    >
      <TrashIcon className="m-[2px] h-3.5 w-3.5" />
      Delete ticket
    </Button>
  );
};
