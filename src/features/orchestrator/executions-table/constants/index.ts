import { CrudActionType } from '@/react-toolkit/types/literal-types';

/**
 * The unique key for the executions query to be used in the query client. ["executions"]
 */
const DATA_QUERY_KEY = ["executions"];

/**
 * The heading for the executions table.
 */
const TABLE_HEADING = "Executions";

/**
 * The column used for searching in the executions.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Execution", description: "" };
    case "read":
      return { heading: "Execution", description: "" };
    case "update":
      return { heading: "Edit Execution", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  TABLE_HEADING,
};
