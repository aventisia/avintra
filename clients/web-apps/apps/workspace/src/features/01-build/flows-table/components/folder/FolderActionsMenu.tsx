import { MenuContent, MenuItem, MenuSeparator } from "@avplatform/ui/dropdown-menu";
import { FolderOpen, MoreHorizontal, SquarePenIcon, Trash2Icon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useNavigate } from "react-router-dom";

import { FoldersTableRowDto } from "../../dtos/folders-table-row.dto";
import { useAgentsPagePaths } from "../../hooks/useAgentsPagePaths.hook";
import { useFolderFormDialog } from "../../hooks/useFolderFormDialog.hook";
import { useFolderDialogStore } from "../../stores/folder-dialog.store";

/**
 * Open, edit and delete menu of a folder tile.
 */
export const FolderActionsMenu = ({ folder }: { folder: FoldersTableRowDto }) => {
  const navigate = useNavigate();
  const openDialog = useFolderDialogStore((state) => state.openDialog);
  const { openEditFolderDialog } = useFolderFormDialog();
  const { getFolderPagePath } = useAgentsPagePaths();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Actions for folder ${folder.name}`}
        className="grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-muted hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-muted data-[state=open]:text-ink-2"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenu.Trigger>
      <MenuContent align="end">
        <MenuItem onSelect={() => navigate(getFolderPagePath(folder.id))}>
          <FolderOpen />
          Open
        </MenuItem>
        <MenuItem onSelect={() => openEditFolderDialog(folder.id)}>
          <SquarePenIcon />
          Edit details
        </MenuItem>
        <MenuSeparator />
        <MenuItem isDestructive onSelect={() => openDialog({ kind: "delete", folder })}>
          <Trash2Icon />
          Delete folder
        </MenuItem>
      </MenuContent>
    </DropdownMenu.Root>
  );
};
