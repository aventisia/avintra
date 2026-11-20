import { LockedActionTooltip } from "@avplatform/ui/action-lock";
import { SplitButton } from "@avplatform/ui/buttons";
import { useCreateEntityAction } from "@avplatform/ui/crud-dialog";
import { MenuContent, MenuItem, MenuShortcut } from "@avplatform/ui/dropdown-menu";
import {
  ArrowSquareInIcon,
  CaretUpIcon,
  FolderPlusIcon,
  OptionIcon,
  PlusIcon,
} from "@phosphor-icons/react";

import NewAgentIcon from "@/components/NewAgentIcon";

import { useFolderFormDialog } from "../hooks/useFolderFormDialog.hook";
import { useImportFlow } from "../hooks/useImportFlow.hook";

/**
 * Split create button of the Agents page: the main part creates an agent, its menu also
 * imports one from a JSON file or creates a folder.
 */
export const AgentsCreateButton = () => {
  const { locked, openCreateDialog } = useCreateEntityAction("flow");
  const { openCreateFolderDialog } = useFolderFormDialog();
  const { fileInputRef, openFilePicker, handleFileChange } = useImportFlow();

  const openCreateAgentDialog = () => openCreateDialog("flow");

  return (
    <LockedActionTooltip>
      <SplitButton
        onClick={openCreateAgentDialog}
        disabled={locked}
        size="default"
        menuLabel="More create options"
        menu={
          <MenuContent align="end">
            <MenuItem onSelect={openCreateAgentDialog} aria-keyshortcuts="Control+Alt+N">
              <NewAgentIcon />
              Create agent
              <MenuShortcut>
                <CaretUpIcon className="-mt-1" />
                <OptionIcon />
                <span className="ml-1">N</span>
              </MenuShortcut>
            </MenuItem>
            <MenuItem onSelect={openFilePicker}>
              <ArrowSquareInIcon />
              Import
            </MenuItem>
            <MenuItem onSelect={() => openCreateFolderDialog()}>
              <FolderPlusIcon />
              Create folder
            </MenuItem>
          </MenuContent>
        }
      >
        <PlusIcon className="size-4" />
        Create
      </SplitButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />
    </LockedActionTooltip>
  );
};
