import { TableCNActionBarItem } from "@avplatform/ui/table-cn";
import { FolderInput } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { MenuContent, MenuItem, MenuLabel, MenuSeparator } from "@/components/MenuParts";
import { pluralize } from "@/utils/pluralize.util";

import { FlowsTableDto } from "../../dtos/flows-table-dto";
import { useFetchFolders } from "../../hooks/useFetchFolders.hook";
import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";
import { canMoveAgent } from "../../utils/agent-drag.util";
import { getFolderColor } from "../../utils/folder-color.util";
import { AgentsRootMark, FolderMark } from "../folder/FolderMark";

type MoveSelectedAgentsMenuProps = {
  agents: FlowsTableDto[];
  onMoved: () => void;
  disabled?: boolean;
};

type TargetFolder = { id: string; name: string } | null;

const DISABLED_ITEM_CLASS_NAME = "data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

/**
 * Action bar menu that moves the selected agents the user can edit to the top level or a folder.
 */
export const MoveSelectedAgentsMenu = ({
  agents,
  onMoved,
  disabled = false,
}: MoveSelectedAgentsMenuProps) => {
  const { folders = [] } = useFetchFolders();
  const { moveFlows } = useMoveFlowToFolder();

  const movableAgents = agents.filter(canMoveAgent);
  const skippedCount = agents.length - movableAgents.length;
  const sortedFolders = [...folders].sort((first, second) => first.name.localeCompare(second.name));

  const getAgentsToMove = (target: TargetFolder) =>
    movableAgents.filter((agent) => (agent.folderId ?? null) !== (target?.id ?? null));

  const moveTo = (target: TargetFolder) => {
    const agentsToMove = getAgentsToMove(target);
    moveFlows({
      flows: agentsToMove.map((agent) => ({ id: agent.id as string, name: agent.name })),
      folder: target,
    });
    onMoved();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <TableCNActionBarItem icon={FolderInput} disabled={disabled || movableAgents.length === 0}>
          Move to
        </TableCNActionBarItem>
      </DropdownMenu.Trigger>
      <MenuContent
        side="top"
        align="start"
        sideOffset={10}
        className="max-h-80 w-64 overflow-y-auto"
      >
        <MenuLabel>
          Move {movableAgents.length} {pluralize(movableAgents.length, "agent")} to
        </MenuLabel>
        <MenuItem
          disabled={getAgentsToMove(null).length === 0}
          onSelect={() => moveTo(null)}
          className={DISABLED_ITEM_CLASS_NAME}
        >
          <AgentsRootMark size="xs" />
          Agents
          <span className="ml-auto text-xs text-slate-400">Top level</span>
        </MenuItem>
        {sortedFolders.length > 0 && <MenuSeparator />}
        {sortedFolders.map((folder) => (
          <MenuItem
            key={folder.id}
            disabled={getAgentsToMove(folder).length === 0}
            onSelect={() => moveTo({ id: folder.id, name: folder.name })}
            className={DISABLED_ITEM_CLASS_NAME}
          >
            <FolderMark color={getFolderColor(folder)} size="xs" />
            <span className="truncate">{folder.name}</span>
          </MenuItem>
        ))}
        {skippedCount > 0 && (
          <p className="px-2.5 pb-1 pt-2 text-xs text-slate-400">
            {skippedCount} selected {pluralize(skippedCount, "agent")} you cannot edit will stay
            where {skippedCount === 1 ? "it is" : "they are"}.
          </p>
        )}
      </MenuContent>
    </DropdownMenu.Root>
  );
};
