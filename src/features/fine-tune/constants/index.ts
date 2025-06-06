import { CrudActionType } from "@aventisia/ui/types";

const FINE_TUNE_TABLE_QUERY_KEY =["fineTuneRecords"];

const HISTORY_TABLE_QUERY_KEY = ["historyRecrords"];

const TABLE_HEADING = "Fine Tune";

/**
 * The column used for searching in the models.
 */
const SEARCH_COLUMN = "docName";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Schedule Fine-tuning", description: "" };
    case "read":
      return { heading: "View Fine-tuning", description: "" };
    case "update":
      return { heading: "Edit Fine-tuning", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  FINE_TUNE_TABLE_QUERY_KEY,
  TABLE_HEADING,
  getDialogHeadingDescription,
  SEARCH_COLUMN,
  HISTORY_TABLE_QUERY_KEY
};
