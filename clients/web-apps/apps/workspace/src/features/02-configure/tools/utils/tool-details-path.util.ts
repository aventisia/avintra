import { TABLE_TAB_QUERY_PARAM } from "../constants/tools-table.constants";

const TOOLS_PATH = "/configure/tools";
const LIBRARY_TAB = "library";

/**
 * Path of the tools list, on the Library tab when asked.
 */
export const getToolsListPath = (isLibraryTab = false) =>
  isLibraryTab ? `${TOOLS_PATH}?${TABLE_TAB_QUERY_PARAM}=${LIBRARY_TAB}` : TOOLS_PATH;

/**
 * Path of a tool's details page; library tools keep the Library tab for the way back.
 */
export const getToolDetailsPath = (id: string, name?: string, isLibraryTool = false) => {
  const params = new URLSearchParams();
  if (name) params.set("tool", name);
  if (isLibraryTool) params.set(TABLE_TAB_QUERY_PARAM, LIBRARY_TAB);
  const query = params.toString();
  return `${TOOLS_PATH}/${id}${query ? `?${query}` : ""}`;
};
