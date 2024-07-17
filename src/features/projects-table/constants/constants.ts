import { CrudActionType } from "@/react-toolkit/types";

/**
 * The unique key for the projects query to be used in the query client. ["projects"]
 */
const DATA_QUERY_KEY = ["projects"];

/**
 * The heading for the projects table.
 */
const TABLE_HEADING = "Projects";

/**
 * The column used for searching in the projects.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Project", description: "" };
    case "read":
      return { heading: "Project", description: "" };
    case "update":
      return { heading: "Edit Project", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  TABLE_HEADING,
  SEARCH_COLUMN,
  getDialogHeadingDescription,
};
