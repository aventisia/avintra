import { CrudActionType } from "@/react-toolkit/types/literal-types";

export const DATA_QUERY_KEY = ["roles"];
export const SEARCH_COLUMN = "name";
export const TABLE_HEADING = "Roles";

export const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Role", description: "" };
    case "read":
      return { heading: "View Role", description: "" };
    case "update":
      return { heading: "Edit Role", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
