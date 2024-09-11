import { Button } from "@/react-toolkit/ui/buttons/Button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/react-toolkit/ui/dropdown-menu";
import { DropdownMenu } from "@/react-toolkit/ui/dropdown-menu/DropdownMenu";
import { updateSupportTicketStatus } from "../../apis/suport-tickets-table-apis";

interface STStatusUpdateActionProps {
  ticketId: string | undefined;
  ticketNumber: string | undefined;
}

export const STStatusUpdateAction = ({
  ticketId,
  ticketNumber,
}: STStatusUpdateActionProps) => {
  // update ticket status
  const data = { ticketId: ticketId || "", ticketNumber };
  const updateTicketStatus = async (status: string) => {
    await updateSupportTicketStatus({ ...data, status });
  };

  return (
    <div className="relative inline-block">
      {/* Button for immediate closure with down arrow */}
      <div className="flex items-center overflow-hidden rounded-md border border-gray-300">
        {/* <Button
          onClick={() => updateTicketStatus("Closed")}
          className="flex-1 bg-blue-500 px-4 py-2 text-lg font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Close ticket
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="border-l border-gray-300 bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none">
              Close ticket ▼
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
            <DropdownMenuItem onClick={() => updateTicketStatus("Closed")}>
              Close ticket as resolved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTicketStatus("Closed")}>
              Close ticket as not required anymore
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
