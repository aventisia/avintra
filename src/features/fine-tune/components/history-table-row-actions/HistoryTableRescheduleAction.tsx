import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

interface HistoryTableRescheduleActionProps {
  fileId: string;
}

export const HistoryTableRescheduleAction = ({
  fileId,
}: HistoryTableRescheduleActionProps) => {
  // Get handle function to open Record
  // const handleOpenFineTuneRecord = useOpenFineTuneRecord();

  console.log(fileId);

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Re-schedule"
      Icon={CalendarDaysIcon}
      onClick={() => console.log("rescehdule")}
    />
  );
};
