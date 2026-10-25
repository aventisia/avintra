import { FOLDER_COLORS } from "../constants/folder-colors.constant";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";

const hashText = (text: string) => {
  let hash = 0;
  for (const character of text) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return Math.abs(hash);
};

/**
 * Palette color saved under the given key, if any.
 */
export const findFolderColor = (key?: string) => FOLDER_COLORS.find((color) => color.key === key);

/**
 * Palette color of a folder: the one chosen for it, or a stable one derived from its id.
 */
export const getFolderColor = (folder: Pick<FoldersTableRowDto, "id" | "color">) =>
  findFolderColor(folder.color) ?? FOLDER_COLORS[hashText(folder.id) % FOLDER_COLORS.length];

/**
 * Random palette color, preselected for a new folder.
 */
export const getRandomFolderColor = () =>
  FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)];
