import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import { ticketOptimisticMutationFn } from "../../apis/ticket-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { TicketDto, TicketTableDto } from "../../dtos/TicketDto";

interface TicketRowDeleteActionProps {
  rowId: string;
}

export const TicketRowDeleteAction = ({ rowId }: TicketRowDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { mutate: deleteTicket } = useListOptimisticMutation<
    string,
    TicketDto | boolean | number,
    TicketTableDto
  >([rowId], ticketOptimisticMutationFn, DATA_QUERY_KEY);

  return (
    <DeleteDDMenuItem
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () =>
            deleteTicket({
              payload: rowId,
              crudAction: "delete",
            }),
          confirmBtnText: "Yes, delete ticket",
          title: "Delete ticket?",
          description: "Are you sure you want to delete this ticket? This action cannot be undone.",
        });
      }}
    />
  );
};
