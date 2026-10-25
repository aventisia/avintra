import { FlowsTableDto } from "../dtos/flows-table-dto";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { FolderSummary } from "../types/folder-summary.type";

const countVisibleAgentsByFolder = (flows: FlowsTableDto[]) => {
  const counts = new Map<string, number>();

  flows.forEach((flow) => {
    if (flow.folderId) counts.set(flow.folderId, (counts.get(flow.folderId) ?? 0) + 1);
  });

  return counts;
};

/**
 * Folders sorted by name, each with the number of its agents the user can see.
 */
export const buildFolderSummaries = (
  flows: FlowsTableDto[],
  folders: FoldersTableRowDto[],
): FolderSummary[] => {
  const visibleAgentCounts = countVisibleAgentsByFolder(flows);

  return [...folders]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((folder) => ({ folder, visibleAgentCount: visibleAgentCounts.get(folder.id) ?? 0 }));
};

/**
 * Keeps only the agents the Archived toggle selects: archived when on, active when off.
 */
export const filterArchivedAgents = (
  flows: FlowsTableDto[] | undefined,
  showArchived: boolean,
): FlowsTableDto[] | undefined =>
  flows?.filter((flow) => Boolean(flow.isArchived) === showArchived);

/**
 * Folder summaries whose name contains the search text, ignoring case.
 */
export const filterFolderSummaries = (summaries: FolderSummary[], searchText: string) => {
  const term = searchText.trim().toLowerCase();
  return term
    ? summaries.filter(({ folder }) => folder.name.toLowerCase().includes(term))
    : summaries;
};

type BuildMainPageAgentsOptions = {
  flows: FlowsTableDto[];
  folders: FoldersTableRowDto[];
  isSearching: boolean;
};

/**
 * Agents listed on the main Agents page: those outside a known folder, or every agent while searching.
 */
export const buildMainPageAgents = ({
  flows,
  folders,
  isSearching,
}: BuildMainPageAgentsOptions): FlowsTableDto[] => {
  if (isSearching) return flows;

  const folderIds = new Set(folders.map((folder) => folder.id));
  return flows.filter((flow) => !flow.folderId || !folderIds.has(flow.folderId));
};

/**
 * Agents listed on a folder page: the visible agents that sit in the given folder.
 */
export const buildFolderPageAgents = (flows: FlowsTableDto[], folderId: string) =>
  flows.filter((flow) => flow.folderId === folderId);

/**
 * Whether another folder already uses the name; names are compared trimmed and case-insensitively, as the server does.
 */
export const isFolderNameTaken = (
  name: string,
  folders: FoldersTableRowDto[],
  ignoredFolderId?: string,
) => {
  const normalizedName = name.trim().toLowerCase();
  return (
    normalizedName !== "" &&
    folders.some(
      (folder) =>
        folder.id !== ignoredFolderId && folder.name.trim().toLowerCase() === normalizedName,
    )
  );
};
