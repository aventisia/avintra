import { cn } from "@avplatform/ui/lib";
import { ChevronsUpDown, FolderPlus } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useNavigate } from "react-router-dom";

import { MenuContent, MenuItem, MenuLabel, MenuSeparator } from "@/components/MenuParts";
import NewAgentIcon from "@/components/NewAgentIcon";

import { useAgentsPagePaths } from "../../hooks/useAgentsPagePaths.hook";
import { useFolderFormDialog } from "../../hooks/useFolderFormDialog.hook";
import { FolderSummary } from "../../types/folder-summary.type";
import { getFolderColor } from "../../utils/folder-color.util";
import { FolderMark } from "../folder/FolderMark";

const CURRENT_FOLDER_ITEM_CLASS_NAME =
  "relative font-medium before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full";

type FolderSwitcherProps = {
  current: FolderSummary;
  summaries: FolderSummary[];
};

/**
 * Breadcrumb button with the open folder's name; its menu jumps to any other folder.
 */
export const FolderSwitcher = ({ current, summaries }: FolderSwitcherProps) => {
  const navigate = useNavigate();
  const { openCreateFolderDialog } = useFolderFormDialog();
  const { agentsPagePath, getFolderPagePath } = useAgentsPagePaths();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Folder ${current.folder.name}, switch folder`}
        className="-my-1 flex min-w-0 items-center gap-2 rounded-md py-1 pl-1 pr-1.5 text-lg font-semibold text-ink outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-muted"
      >
        <FolderMark color={getFolderColor(current.folder)} size="sm" />
        <span className="max-w-[18rem] truncate">{current.folder.name}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenu.Trigger>
      <MenuContent align="start" className="w-64">
        <MenuLabel>Folders</MenuLabel>
        <div className="max-h-72 overflow-y-auto">
          {summaries.map(({ folder, visibleAgentCount }) => {
            const isCurrent = folder.id === current.folder.id;
            const color = getFolderColor(folder);

            return (
              <MenuItem
                key={folder.id}
                aria-current={isCurrent ? "page" : undefined}
                onSelect={() => navigate(getFolderPagePath(folder.id))}
                className={
                  isCurrent ? cn(CURRENT_FOLDER_ITEM_CLASS_NAME, color.currentMenuItem) : undefined
                }
              >
                <FolderMark color={color} size="xs" />
                <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    isCurrent ? "opacity-60" : "text-muted-foreground",
                  )}
                >
                  {visibleAgentCount}
                </span>
              </MenuItem>
            );
          })}
        </div>
        <MenuSeparator />
        <MenuItem onSelect={() => navigate(agentsPagePath)}>
          <NewAgentIcon />
          All agents
        </MenuItem>
        <MenuItem onSelect={() => openCreateFolderDialog()}>
          <FolderPlus />
          New folder
        </MenuItem>
      </MenuContent>
    </DropdownMenu.Root>
  );
};
