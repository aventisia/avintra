import { CrudActionType } from '@/react-toolkit/types/literal-types';

/**
 * The unique key for the configs query to be used in the query client. ["configs"]
 */
const DATA_QUERY_KEY = ["vault"];

/**
 * The heading for the configs table.
 */
const TABLE_HEADING = "Vault";

/**
 * The column used for searching in the configs.
 */
const SEARCH_COLUMN = "name";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Credentials", description: "" };
    case "read":
      return { heading: "Credentials", description: "" };
    case "update":
      return { heading: "Edit Credentials", description: "" };
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
