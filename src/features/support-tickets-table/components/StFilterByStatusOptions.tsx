import { useState } from "react";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { Tabs, TabsList, TabsTrigger } from "@/react-toolkit/ui/tabs";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";

export const StFilterByStatusOptions = () => {
  // Fetch support tickets data
  const { data, refetch } = useFetchSupportTickets();

  // Get store setSupportTicketsState action
  const { selectedSupportTicket, userRole, setSupportTicketsState } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        selectedSupportTicket: state.selectedSupportTicket,
        userRole: state.userRole,
        setSupportTicketsState: state.setSupportTicketsState,
      })),
    );

  // Filter support tickets by status
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const handleFilter = (status: string | undefined) => {
    setFilterStatus(status);
    if (status === undefined) {
      setSupportTicketsState(data?.data || [], selectedSupportTicket, userRole);
    } else {
      setSupportTicketsState(
        data?.data.filter(
          (ticket: SupportTicketsTableDto) => ticket.status === status,
        ) || [],
        selectedSupportTicket,
        userRole,
      );
    }
  };

  const handleRoleChange = (userRole: string) => {
    console.log("Role changed to: ", userRole);

    setSupportTicketsState(data?.data || [], selectedSupportTicket, userRole);
    // Refetch the data to reflect the role change
    const result = refetch().then(() => console.log("Refetching data..."));
    console.log("Refetch result: ", result);

    console.log(`Changed Data based on role: ${userRole}`, data?.data);
  };

  // Calculate ticket counts
  const openCount =
    data?.data.filter(
      (ticket: SupportTicketsTableDto) => ticket.status === "Open",
    ).length || 0;
  const closedCount =
    data?.data.filter(
      (ticket: SupportTicketsTableDto) => ticket.status === "Closed",
    ).length || 0;
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
      <Tabs
        defaultValue="Reviewer"
        onValueChange={(value) => handleRoleChange(value)}
      >
        <TabsList>
          <TabsTrigger value="Reviewer">Reviewer</TabsTrigger>
          <TabsTrigger value="User">User</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
