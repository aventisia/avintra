import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useRescheduleFineTuneStore } from "../../stores/reschedule-fine-tune-store";

interface HistoryTableRescheduleActionProps {
  rowId: string;
}

export const HistoryTableRescheduleAction = ({
  rowId,
}: HistoryTableRescheduleActionProps) => {
  const { setShowDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  const { setRescheduleId } = useRescheduleFineTuneStore();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Re-schedule"
      Icon={CalendarDaysIcon}
      onClick={() => {
        setShowDialog(true);
        setRescheduleId(rowId);
      }}
    />
  );
};
