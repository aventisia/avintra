import { useState } from "react";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";

export const StFilterByStatusOptions = () => {
  // Fetch support tickets data
  const { data } = useFetchSupportTickets();

  // Get store setSupportTicketsState action
  const { selectedSupportTicket, setSupportTicketsState } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        selectedSupportTicket: state.selectedSupportTicket,
        setSupportTicketsState: state.setSupportTicketsState,
      })),
    );

  // Filter support tickets by status
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const handleFilter = (status: string | undefined) => {
    setFilterStatus(status);
    if (status === undefined) {
      setSupportTicketsState(data?.data || [], selectedSupportTicket);
    } else {
      setSupportTicketsState(
        data?.data.filter((ticket) => ticket.status === status) || [],
        selectedSupportTicket,
      );
    }
  };

  // Calculate ticket counts
  const openCount =
    data?.data.filter((ticket) => ticket.status === "Open").length || 0;
  const closedCount =
    data?.data.filter((ticket) => ticket.status === "Closed").length || 0;
  const totalCount = data?.data.length || 0;

  return (
    <div className="mx-4 mt-4 flex space-x-4">
      <div
        className={`cursor-pointer ${filterStatus === "Open" ? "font-medium" : "font-extralight"}`}
        onClick={() =>
          handleFilter(filterStatus === "Open" ? undefined : "Open")
        }
      >
        {openCount} Open
      </div>
      <div
        className={`cursor-pointer ${filterStatus === "Closed" ? "font-medium" : "font-extralight"}`}
        onClick={() =>
          handleFilter(filterStatus === "Closed" ? undefined : "Closed")
        }
      >
        {closedCount} Closed
      </div>
      <div
        className={`cursor-pointer ${filterStatus === undefined ? "font-medium" : "font-extralight"}`}
        onClick={() => handleFilter(undefined)}
      >
        {totalCount} All
      </div>
    </div>
  );
};
