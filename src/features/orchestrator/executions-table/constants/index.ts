import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the jobs query to be used in the query client. ["jobs"]
 */
const DATA_QUERY_KEY = ["jobs"];

/**
 * The heading for the jobs table.
 */
const TABLE_HEADING = "Jobs";

const TABLE_KEY = "jobs";

/**
 * The column used for searching in the jobs.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Job", description: "" };
    case "read":
      return { heading: "Job", description: "" };
    case "update":
      return { heading: "Edit Job", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
  TABLE_KEY,
};
