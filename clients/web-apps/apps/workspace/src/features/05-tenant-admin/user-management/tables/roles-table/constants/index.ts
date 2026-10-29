import { DialogCrudAction } from "@avplatform/ui/types";

export const DATA_QUERY_KEY = ["roles"];
export const TABLE_HEADING = "Roles";
export const TABLE_KEY = "roles";

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add role", description: "" };
    case "read":
      return { heading: "View role", description: "" };
    case "update":
      return { heading: "Edit role", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
