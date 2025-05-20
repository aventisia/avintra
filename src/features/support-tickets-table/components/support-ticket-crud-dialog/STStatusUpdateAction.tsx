import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aventisia/ui/dropdown-menu";

import { updateSupportTicketStatus } from "../../apis/suport-tickets-table-apis";

interface STStatusUpdateActionProps {
  ticketId: string | undefined;
  ticketNumber: string | undefined;
  currentStatus: string | undefined;
  onUpdate: () => void;
}

export const STStatusUpdateAction = ({
  ticketId,
  ticketNumber,
  currentStatus,
  onUpdate,
}: STStatusUpdateActionProps) => {
  // update ticket status
  const data = { ticketId: ticketId || "", ticketNumber };
  const updateTicketStatus = async (status: string) => {
    await updateSupportTicketStatus({ ...data, status });
    onUpdate();
  };

  return (
    <div className="relative inline-block">
      {/* Button for immediate closure with down arrow */}
      <div className="flex items-center overflow-hidden rounded-md border border-gray-300">
        <DropdownMenu>
          <DropdownMenuTrigger className="border-l border-gray-300 bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none">
            {currentStatus === "Open" ? "Close ticket ▼" : "Reopen ticket ▼"}
          </DropdownMenuTrigger>

          <DropdownMenuContent className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
            {currentStatus === "Open" ? (
              <>
                <DropdownMenuItem onClick={() => updateTicketStatus("Closed")}>
                  Close ticket as resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTicketStatus("Closed")}>
                  Close ticket as not required anymore
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => updateTicketStatus("Open")}>
                  Reopen ticket
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
