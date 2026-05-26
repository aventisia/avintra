import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { SupportTicketsTableDto } from "../../dtos/SupportTicketsTableDto";
import { useFetchSupportTicket } from "../../hooks/useFetchSupportTicket";
import { SupportTicketTDeleteAction } from "../st-remark-row-actions/SupportTicketDeleteAction";

/**
 * Support ticket details side component.
 */
export const STDetailsSideComponent = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // useNavigate hook for navigation
  const navigate = useNavigate();

  // useLocation hook for getting the query params
  const location = useLocation();

  // Get the support ticket id from the query params
  const id = new URLSearchParams(location.search).get("st") ?? "";

  // Fetch support ticket data
  const { data } = useFetchSupportTicket(id);

  // State for support ticket data
  const [STData, setSTData] = useState<SupportTicketsTableDto | null>(
    data?.data ?? null,
  );

  // Set support ticket data to state on data change
  useEffect(() => {
    setSTData(data?.data ?? null);
  }, [data]);

  const RouteToSTtable = () => {
    // Route to the support tickets table page
    navigate("/tenant/support/tickets");
  };

  return (
    <div className="sideComponent ml-4 flex h-full w-full flex-col space-y-4 text-2xs">
      {/* back button to navigate to support tickets table page */}
      <div>
        <Button
          variant={"link"}
          size={"lg"}
          className=""
          onClick={RouteToSTtable}
        >
          <ArrowLeftCircleIcon className="mr-1 h-5 w-5" />
          Go back
        </Button>
      </div>
      {/* Support ticket id */}
      <div className="space-y-2 pl-1 text-gray-600">
        <p className="font-medium">Ticket id</p>
        <p className="font-light">{STData?.id ?? "Not assigned yet"}</p>
      </div>
      <Separator />
      {/* Support ticket number */}
      <div className="space-y-2 pl-1 text-gray-600">
        <p className="font-medium">Ticket number</p>
        <p className="font-light">
          {STData?.ticketNumber ?? "Not assigned yet"}
        </p>
      </div>
      <Separator />
      {/* Support ticket status */}
      <div className="space-y-2 pl-1 text-gray-600">
        <p className="font-medium">Ticket status</p>
        <p className="font-light">{STData?.status ?? "None yet"}</p>
      </div>
      <Separator />
      {/* Support ticket creation date and time */}
      <div className="space-y-2 pl-1 text-gray-600">
        <p className="font-medium">Date & time of creation</p>
        <p className="font-light">
          {STData?.createdOn
            ? formatDistanceToNow(new Date(STData.createdOn), {
                addSuffix: true,
              })
            : "Not assigned yet"}
        </p>
      </div>
      <Separator />
      {/* Support ticket last modification date and time */}
      <div className="space-y-2 pl-1 text-gray-600">
        <p className="font-medium">Date & time of last modification</p>
        <p className="font-light">
          {STData?.lastModifiedOn
            ? formatDistanceToNow(new Date(STData.lastModifiedOn), {
                addSuffix: true,
              })
            : "Not assigned yet"}
        </p>
      </div>
      <Separator />
      {/* Support ticket delete component */}
      {data &&
        !userSession?.userRoles.some((role) => ["SA"].includes(role)) && (
          <SupportTicketTDeleteAction rowId={id} />
        )}
    </div>
  );
};
