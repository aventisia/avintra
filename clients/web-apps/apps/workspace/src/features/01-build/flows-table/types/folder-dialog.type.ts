import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { MovableAgent } from "./movable-agent.type";

/**
 * The in-memory folder dialog (delete or move). Create and edit open through the URL-driven CRUD dialog (`e=folder`).
 */
export type FolderDialog =
  { kind: "delete"; folder: FoldersTableRowDto } | { kind: "move"; agent: MovableAgent };
