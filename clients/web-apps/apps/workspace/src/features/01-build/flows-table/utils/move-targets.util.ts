import { FolderSummary } from "../types/folder-summary.type";
import { MoveTarget } from "../types/move-target.type";
import { filterFolderSummaries, isFolderNameTaken } from "./agents-list-items.util";

type BuildMoveTargetsOptions = {
  summaries: FolderSummary[];
  query: string;
  currentFolderId: string | null;
};

/**
 * Destinations for an agent: the top level when it is in a folder, the matching folders it is
 * not in, and a new folder named after the query when no folder has that name.
 */
export const buildMoveTargets = ({
  summaries,
  query,
  currentFolderId,
}: BuildMoveTargetsOptions): MoveTarget[] => {
  const trimmedQuery = query.trim();
  const folders = summaries.map(({ folder }) => folder);

  const rootTargets: MoveTarget[] = currentFolderId && !trimmedQuery ? [{ kind: "root" }] : [];
  const folderTargets: MoveTarget[] = filterFolderSummaries(summaries, trimmedQuery)
    .filter(({ folder }) => folder.id !== currentFolderId)
    .map((summary) => ({ kind: "folder", summary }));
  const createTargets: MoveTarget[] =
    trimmedQuery && !isFolderNameTaken(trimmedQuery, folders)
      ? [{ kind: "create", name: trimmedQuery }]
      : [];

  return [...rootTargets, ...folderTargets, ...createTargets];
};

/**
 * Stable key of a move destination.
 */
export const getMoveTargetKey = (target: MoveTarget) =>
  target.kind === "folder" ? target.summary.folder.id : target.kind;
