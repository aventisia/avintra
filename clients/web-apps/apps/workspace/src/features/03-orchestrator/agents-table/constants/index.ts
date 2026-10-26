import type { DialogCrudAction } from "@avplatform/ui/types";

export const TABLE_KEY = "agents-table";

export const DATA_QUERY_KEY = ["agents"];

export const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Assign Machines", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
