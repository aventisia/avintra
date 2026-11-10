import { type CrudEntityKey } from "@/ui/types";

import { useCrudDialogUrlState } from "./useCrudDialogUrlState";

interface CrudOpenViewCellProps {
  rowId: string;
  cellContent: string;
  entity: CrudEntityKey;
}

export const CrudOpenViewCell = ({ rowId, cellContent, entity }: CrudOpenViewCellProps) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  const handleOpenRead = () => {
    if (!rowId) return;

    openCrudDialog({
      entity,
      crudAction: "read",
      rowId,
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
