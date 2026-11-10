import { useCrudDialogUrlState } from "@avplatform/ui/crud-dialog";
import { PlusIcon } from "@phosphor-icons/react";

import { FoldersTableRowDto } from "../../dtos/folders-table-row.dto";
import { getFolderColor } from "../../utils/folder-color.util";
import { FolderMark } from "../folder/FolderMark";

/**
 * Empty folder page: explains how agents get into a folder and offers to create one here.
 */
export const FolderEmptyState = ({ folder }: { folder: FoldersTableRowDto }) => {
  const { openCrudDialog } = useCrudDialogUrlState();

  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-sunken/40 px-6 py-12 text-center">
      <FolderMark color={getFolderColor(folder)} size="xl" className="rotate-[-4deg]" />
      <p className="mt-4 text-[15px] font-semibold text-ink">This folder is empty</p>
      <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground">
        Drag agents onto it from the Agents page, choose Move to folder in any agent’s menu, or
        create a new agent here.
      </p>
      <button
        type="button"
        onClick={() =>
          openCrudDialog({
            entity: "flow",
            crudAction: "create",
            rowId: window.crypto.randomUUID(),
          })
        }
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground outline-none transition hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <PlusIcon className="size-4" />
        Create agent here
      </button>
    </div>
  );
};
