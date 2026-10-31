import { NavLink } from "react-router-dom";

import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { useAgentsPagePaths } from "../hooks/useAgentsPagePaths.hook";
import { getFolderColor } from "../utils/folder-color.util";
import { FolderGlyph } from "./folder/FolderGlyph";

/**
 * Small link chip showing the folder an agent sits in; opens that folder.
 */
export const FolderChip = ({ folder }: { folder: FoldersTableRowDto }) => {
  const { getFolderPagePath } = useAgentsPagePaths();

  return (
    <NavLink
      to={getFolderPagePath(folder.id)}
      title={`Open folder ${folder.name}`}
      draggable={false}
      className="inline-flex max-w-36 shrink-0 items-center gap-1 rounded-sm bg-popover py-0.5 pl-1.5 pr-2.5 text-[11px] font-medium text-ink-2 ring-1 ring-border transition hover:text-ink hover:ring-line-strong"
    >
      <FolderGlyph className={`size-3.5 shrink-0 ${getFolderColor(folder).glyph}`} />
      <span className="truncate">{folder.name}</span>
    </NavLink>
  );
};
