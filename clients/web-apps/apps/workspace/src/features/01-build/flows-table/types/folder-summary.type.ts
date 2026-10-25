import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";

/**
 * A folder with the number of its agents the user can see.
 */
export type FolderSummary = {
  folder: FoldersTableRowDto;
  visibleAgentCount: number;
};
