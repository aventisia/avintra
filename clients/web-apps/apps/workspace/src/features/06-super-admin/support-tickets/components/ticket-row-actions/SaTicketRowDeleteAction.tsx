import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useListOptimisticMutation, useShowAlertHandler } from "@avplatform/ui/hooks";

import {
  TicketDto,
  TicketTableDto,
} from "@/features/05-tenant-admin/support-tickets-v2/dtos/TicketDto";

import { saTicketOptimisticMutationFn } from "../../apis/sa-ticket-apis";
import { DATA_QUERY_KEY } from "../../constants";

interface SaTicketRowDeleteActionProps {
  rowId: string;
}

export const SaTicketRowDeleteAction = ({ rowId }: SaTicketRowDeleteActionProps) => {
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { mutate: deleteTicket } = useListOptimisticMutation<
    string,
    TicketDto | boolean | number,
    TicketTableDto
  >([rowId], saTicketOptimisticMutationFn, DATA_QUERY_KEY);

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
