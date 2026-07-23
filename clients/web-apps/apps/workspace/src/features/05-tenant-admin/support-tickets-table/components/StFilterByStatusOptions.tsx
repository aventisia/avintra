import { Button } from "@avplatform/ui/buttons";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SupportTicketsTableDto } from "../dtos/SupportTicketsTableDto";
import { useFetchSupportTickets } from "../hooks/useFetchSupportTickets";
import { useSupportTicketsTableStore } from "../stores/support-tickets-table-store";

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
  const { selectedSupportTicket, setSupportTicketsState } = useSupportTicketsTableStore(
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
          ticket.createdBy === userSession?.firstName + " " + userSession?.lastName,
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
        openCount: data.filter((ticket: SupportTicketsTableDto) => ticket.status === "Open").length,
        closedCount: data.filter((ticket: SupportTicketsTableDto) => ticket.status === "Closed")
          .length,
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
          onClick={() => handleFilter(filterStatus === "Open" ? undefined : "Open")}
          variant={"link"}
        >
          {counts.openCount} Open
        </Button>
        <Button
          className={`cursor-pointer ${filterStatus === "Closed" ? "font-medium" : "font-extralight"}`}
          onClick={() => handleFilter(filterStatus === "Closed" ? undefined : "Closed")}
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
      {userSession?.userRoles.some((role) => ["SA"].includes(role)) && (
        <Tabs defaultValue="Reviewer" onValueChange={(value) => handleRoleChange(value)}>
          <TabsList>
            <TabsTrigger value="Reviewer">Reviewer</TabsTrigger>
            <TabsTrigger value="User">User</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
};
