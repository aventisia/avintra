import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { DATA_QUERY_KEY } from "../constants/constants";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";

/**
 * Custom hook to handle opening a support ticket.
 *
 * @returns A function to handle opening the support ticket.
 */
export const useOpenSupportTicket = (rowId: string) => {
  // Get the navigate function
  const navigate = useNavigate();

  // Get support tickets store state and actions
  const { filteredData, setSupportTicketsState } = useSupportTicketsTableStore(
    (state) => ({
      filteredData: state.filteredData,
      setSupportTicketsState: state.setSupportTicketsState,
    }),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Handle open support ticket action
  const handleOpenSupportTicketAction = () => {
    // // Get support tickets data from query client
    const supportTicketsData = queryClient.getQueryData<{
      data: SupportTicketsTableDto[];
    }>(DATA_QUERY_KEY);

    // // Get support ticket data by id
    const supportTicketData = supportTicketsData?.data.find(
      (item) => item.id === rowId,
    );

    // Set the selected support ticket in the store
    setSupportTicketsState(filteredData, supportTicketData || null, false);

    // Navigate to support ticket details page
    navigate(`/tenant/support/ticket/details?st=${rowId}`);
  };

  // Return the handle open support ticket action function
  return handleOpenSupportTicketAction;
};
