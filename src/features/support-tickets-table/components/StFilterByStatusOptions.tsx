import { useState, useEffect } from "react";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";
import { useShallow } from "zustand/react/shallow";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { Tabs, TabsList, TabsTrigger } from "@/react-toolkit/ui/tabs";
import { Button } from "@/react-toolkit/ui/buttons/Button";

export const StFilterByStatusOptions = () => {
  // Fetch support tickets data
  const { data } = useFetchSupportTickets();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get store setSupportTicketsState action
  const { selectedSupportTicket, setSupportTicketsState } =
    useSupportTicketsTableStore(
      useShallow((state) => ({
        selectedSupportTicket: state.selectedSupportTicket,
        setSupportTicketsState: state.setSupportTicketsState,
      })),
    );

  // Manage filter status
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  // Manage role selection
  const [currentRole, setCurrentRole] = useState<string>("Reviewer");

  // Get counts of open, closed, and total tickets
  const [counts, setCounts] = useState<{
    openCount: number;
    closedCount: number;
    totalCount: number;
  }>({
    openCount: 0,
    closedCount: 0,
    totalCount: 0,
  });

  // Apply filters and update filteredData
  const applyFilters = (data: SupportTicketsTableDto[]) => {
    let filtered = data;

    // Filter by role
    if (currentRole === "User") {
      filtered = filtered.filter(
        (ticket: SupportTicketsTableDto) =>
          ticket.createdBy ===
          userSession?.firstName + " " + userSession?.lastName,
      );
      const openTicketsCount = filtered.filter(
        (ticket: SupportTicketsTableDto) => ticket.status === "Open",
      ).length;
      const closedTicketsCount = filtered.filter(
        (ticket: SupportTicketsTableDto) => ticket.status === "Closed",
      ).length;
      setCounts({
        openCount: openTicketsCount,
        closedCount: closedTicketsCount,
        totalCount: openTicketsCount + closedTicketsCount,
      });
    }

    // If the role is Reviewer, reset the counts
    if (currentRole === "Reviewer") {
      setCounts({
        openCount: data.filter(
          (ticket: SupportTicketsTableDto) => ticket.status === "Open",
        ).length,
        closedCount: data.filter(
          (ticket: SupportTicketsTableDto) => ticket.status === "Closed",
        ).length,
        totalCount: data.length,
      });
    }

    // Filter by status
    if (filterStatus !== undefined) {
      filtered = filtered.filter(
        (ticket: SupportTicketsTableDto) => ticket.status === filterStatus,
      );
    }

    setSupportTicketsState(filtered, selectedSupportTicket, false);
  };

  // Handle status filter changes
  const handleFilter = (status: string | undefined) => {
    setFilterStatus(status);
    if (data?.data) {
      applyFilters(data.data);
    }
  };

  // Handle role changes
  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    if (data?.data) {
      applyFilters(data.data);
    }
  };

  // Initial application of filters
  useEffect(() => {
    if (data?.data) {
      applyFilters(data.data);
    }
  }, [data, currentRole, filterStatus]);

  return (
    <div className="mt-2 flex">
      {/* Filter buttons for Open, Closed, and All */}
      <div className="mx-4 flex space-x-4">
        <Button
          className={`cursor-pointer ${filterStatus === "Open" ? "font-medium" : "font-extralight"}`}
          onClick={() =>
            handleFilter(filterStatus === "Open" ? undefined : "Open")
          }
          variant={"link"}
        >
          {counts.openCount} Open
        </Button>
        <Button
          className={`cursor-pointer ${filterStatus === "Closed" ? "font-medium" : "font-extralight"}`}
          onClick={() =>
            handleFilter(filterStatus === "Closed" ? undefined : "Closed")
          }
          variant={"link"}
        >
          {counts.closedCount} Closed
        </Button>
        <Button
          className={`cursor-pointer ${filterStatus === undefined ? "font-medium" : "font-extralight"}`}
          onClick={() => handleFilter(undefined)}
          variant={"link"}
        >
          {counts.totalCount} All
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
