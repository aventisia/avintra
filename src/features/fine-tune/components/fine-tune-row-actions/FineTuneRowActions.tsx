import { DataTableRowActions } from "@aventisia/ui/data-table";

// import { DropdownMenuSeparator } from "@aventisia/ui/dropdown-menu";

import { FineTuneRowDeleteAction } from "./FineTuneRowDeleteAction";
import { FineTuneRowOpenAction } from "./FineTuneRowOpenAction";

// import { ModelRowOpenAction } from "./ModelOpenAction";
// import { ModelLabelDataAction } from "./ModelLabelDataAction";
// import { ModelRowDeleteAction } from "./ModelRowDeleteAction";

// import { ModelTestAction } from "./ModelTestAction";

interface FineTuneRowActionsProps {
  rowId: string;
  fileId: string;
}

export const FineTuneRowActions = ({
  rowId,
  fileId,
}: FineTuneRowActionsProps) => {
  return (
    // Dropdown menu for model table row action */}
    <DataTableRowActions className="w-32">
      {/* To Label data model */}
      {/* <ModelLabelDataAction rowId={rowId} /> */}

      {/* To Test model */}
      {/* <ModelTestAction rowId={rowId} /> */}

      {/* To open a row */}
      <FineTuneRowOpenAction fileId={fileId} />

      {/* DropdownMenuSeparator component */}
      {/* <DropdownMenuSeparator /> */}

      {/* View the model details */}
      {/* <DTRowAction rowId={rowId} crudAction="read" /> */}

      {/* Edit model details */}
      {/* <DTRowAction rowId={rowId} crudAction="update" /> */}

      {/* DropdownMenuSeparator component */}
      {/* <DropdownMenuSeparator /> */}

      {/* Triggers model delete alert dialog  */}
      <FineTuneRowDeleteAction rowId={rowId} />
    </DataTableRowActions>
  );
};
