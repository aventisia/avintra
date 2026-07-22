import { useShallow } from "zustand/react/shallow";

import { useDataTableQueryParams } from "@/ui/components/data-table";
import { useDTCrudDialogStore } from "@/ui/stores";

interface DTOpenViewCellProps {
  rowId: string;
  cellContent: string;
}
/**
 * A component that renders a cell in a data table which, when clicked, opens a read view of the corresponding row.
 */
export const DTOpenViewCell = ({ rowId, cellContent }: DTOpenViewCellProps) => {
  // Get set function for crudAction query param
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get set function for crudAction query param
  const { setCrudAction, setRowId } = useDataTableQueryParams();

  // Function to handle opening the read view of the machine
  const handleOpenRead = () => {
    if (!rowId) return;

    setCrudAction("read");
    setRowId(rowId);
    setCrudDialogOptions({
      showDialog: true,
      rowId,
      crudAction: "read",
    });
  };

  return (
    <button
      className="group flex cursor-pointer items-center truncate"
      onClick={handleOpenRead}
      disabled={!rowId}
      title={cellContent}
    >
      <span className="w-full max-w-60 truncate border-b-[0.1rem] border-transparent text-left font-medium text-foreground group-hover:border-primary group-hover:text-primary">
        {cellContent}
      </span>
    </button>
  );
};
