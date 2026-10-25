import { LockedActionTooltip } from "@avplatform/ui/action-lock";
import { SplitButton } from "@avplatform/ui/buttons";
import { useCreateEntityAction } from "@avplatform/ui/data-table";
import { ChevronUp, FolderPlus, Option, Plus } from "lucide-react";

import { MenuContent, MenuItem, MenuShortcut } from "@/components/MenuParts";
import NewAgentIcon from "@/components/NewAgentIcon";

import { useFolderDialogStore } from "../stores/folder-dialog.store";

/**
 * Split create button of the Agents page: the main part creates an agent, its menu also
 * creates a folder.
 */
export const AgentsCreateButton = () => {
  const { locked, openCreateDialog } = useCreateEntityAction("flow");
  const openFolderDialog = useFolderDialogStore((state) => state.openDialog);

  const openCreateAgentDialog = () => openCreateDialog("flow");

  return (
    <LockedActionTooltip>
      <SplitButton
        onClick={openCreateAgentDialog}
        disabled={locked}
        menuLabel="More create options"
        menu={
          <MenuContent align="end">
            <MenuItem onSelect={openCreateAgentDialog} aria-keyshortcuts="Control+Alt+N">
              <NewAgentIcon />
              Create agent
              <MenuShortcut>
                <ChevronUp className="-mt-1" />
                <Option />
                <span className="ml-1">N</span>
              </MenuShortcut>
            </MenuItem>
            <MenuItem onSelect={() => openFolderDialog({ kind: "create" })}>
              <FolderPlus />
              Create folder
            </MenuItem>
          </MenuContent>
        }
      >
        <Plus className="size-4" />
        Create
      </SplitButton>
    </LockedActionTooltip>
  );
};
