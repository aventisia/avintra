import { CrudActionType } from "@avplatform/ui/types";

export const FLOWS_QUERY_KEY = ["flows"];

/**
 * Returns the heading and description based on the provided CRUD action type.
 * @param crudAction - The CRUD action type.
 * @returns An object containing the heading and description.
 */
export const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Agent", description: "" };
    case "read":
      return { heading: "Agent", description: "" };
    case "update":
      return { heading: "Edit Agent", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
