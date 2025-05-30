import { CrudActionType } from "@aventisia/ui/types";

const RUN_REIVEW_TABLE_QUERY_KEY = ["runReview"];

const TABLE_HEADING = "Records";

/**
 * The column used for searching in the models.
 */
const SEARCH_COLUMN = "docName";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Record", description: "" };
    case "read":
      return { heading: "Update Record", description: "" };
    case "update":
      return { heading: "Edit Record", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
    RUN_REIVEW_TABLE_QUERY_KEY,
  TABLE_HEADING,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
};
