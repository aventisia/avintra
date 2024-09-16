import { useState } from "react";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { Tabs, TabsList, TabsTrigger } from "@/react-toolkit/ui/tabs";
import { Button } from "@/react-toolkit/ui/buttons/Button";

export const StFilterByStatusOptions = () => {
  // Fetch support tickets data
  const { data, refetch } = useFetchSupportTickets();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get store setSupportTicketsState action
  const { filteredData, selectedSupportTicket, setSupportTicketsState } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        filteredData: state.filteredData,
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
        data?.data.filter(
          (ticket: SupportTicketsTableDto) => ticket.status === status,
        ) || [],
        selectedSupportTicket,
      );
    }
  };

  // Filter support tickets by role
  const handleRoleChange = (role: string) => {
    if (role === "User") {
      setSupportTicketsState(
        data?.data.filter(
          (ticket: SupportTicketsTableDto) =>
            ticket.createdBy ===
            userSession?.firstName + " " + userSession?.lastName,
        ) || [],
        selectedSupportTicket,
      );
    } else {
      setSupportTicketsState(data?.data || [], selectedSupportTicket);
      refetch().then(() => console.log("Refetching data..."));
    }
  };

  // Calculate counts based on filteredData
  const getCounts = () => {
    if (!filteredData) return { openCount: 0, closedCount: 0, totalCount: 0 };

    const openCount = filteredData.filter(
      (ticket: SupportTicketsTableDto) => ticket.status === "Open",
    ).length;

    const closedCount = filteredData.filter(
      (ticket: SupportTicketsTableDto) => ticket.status === "Closed",
    ).length;

    const totalCount = filteredData.length;

    return { openCount, closedCount, totalCount };
  };

  // Get filter counts
  const { openCount, closedCount, totalCount } = getCounts();

  return (
    <div className="mx-4 mt-4 flex space-x-4">
      {/* Filter buttons for Open, Closed, and All */}
      <div>
        <Button
          className={`cursor-pointer ${filterStatus === "Open" ? "font-medium" : "font-extralight"}`}
          onClick={() =>
            handleFilter(filterStatus === "Open" ? undefined : "Open")
          }
          variant={"link"}
        >
          {openCount} Open
        </Button>
        <Button
          className={`cursor-pointer ${filterStatus === "Closed" ? "font-medium" : "font-extralight"}`}
          onClick={() =>
            handleFilter(filterStatus === "Closed" ? undefined : "Closed")
          }
          variant={"link"}
        >
          {closedCount} Closed
        </Button>
        <Button
          className={`cursor-pointer ${filterStatus === undefined ? "font-medium" : "font-extralight"}`}
          onClick={() => handleFilter(undefined)}
          variant={"link"}
        >
          {totalCount} All
        </Button>
      </div>
      {/* Toggle button for Reviewer/User */}
      {userSession?.userRoles.some((role) =>
        ["SA", "GA", "GSA"].includes(role),
      ) && (
        <Tabs
          defaultValue="Reviewer"
          onValueChange={(value) => handleRoleChange(value)}
        >
          <TabsList>
            <TabsTrigger value="Reviewer">Reviewer</TabsTrigger>
            <TabsTrigger value="User">User</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
};
