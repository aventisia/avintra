import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { MovableAgent } from "./movable-agent.type";

/**
 * The folder dialog to show and the data it opens with.
 */
export type FolderDialog =
  | { kind: "create"; agentToMove?: MovableAgent }
  | { kind: "edit"; folder: FoldersTableRowDto }
  | { kind: "delete"; folder: FoldersTableRowDto }
  | { kind: "move"; agent: MovableAgent };
