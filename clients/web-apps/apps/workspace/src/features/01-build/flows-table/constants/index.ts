const FLOWS_QUERY_KEY = ["flows"];

const FOLDERS_QUERY_KEY = ["folders"];

const FOLDER_NOT_FOUND_TOAST_ID = "folder-not-found";

const TABLE_HEADING = "Agents";

const AGENTS_PAGE_PATH = "/agents";

const SHOW_ARCHIVED_QUERY_PARAM = "archived";

const SHOW_ARCHIVED_QUERY_VALUE = "1";

const withShowArchived = (path: string, showArchived: boolean) =>
  showArchived ? `${path}?${SHOW_ARCHIVED_QUERY_PARAM}=${SHOW_ARCHIVED_QUERY_VALUE}` : path;

const getAgentsPagePath = (showArchived = false) =>
  withShowArchived(AGENTS_PAGE_PATH, showArchived);

const getFolderPagePath = (folderId: string, showArchived = false) =>
  withShowArchived(`${AGENTS_PAGE_PATH}/folders/${folderId}`, showArchived);

const FOLDER_PAGE_PATH_PATTERN = `${AGENTS_PAGE_PATH}/folders/:folderId`;

const TABLE_KEY = "flows";

export {
  AGENTS_PAGE_PATH,
  FLOWS_QUERY_KEY,
  FOLDERS_QUERY_KEY,
  FOLDER_NOT_FOUND_TOAST_ID,
  FOLDER_PAGE_PATH_PATTERN,
  getAgentsPagePath,
  getFolderPagePath,
  SHOW_ARCHIVED_QUERY_PARAM,
  SHOW_ARCHIVED_QUERY_VALUE,
  TABLE_HEADING,
  TABLE_KEY,
};
