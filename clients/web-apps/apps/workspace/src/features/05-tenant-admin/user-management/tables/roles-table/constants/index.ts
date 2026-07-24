import { DialogCrudAction } from "@avplatform/ui/types";

export const DATA_QUERY_KEY = ["roles"];
export const TABLE_HEADING = "Roles";
export const TABLE_KEY = "roles";

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
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
