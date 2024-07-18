import { CrudActionType } from "@/react-toolkit/types";

/**
 * Returns the heading and description based on the provided CRUD action type.
 * @param crudAction - The CRUD action type.
 * @returns An object containing the heading and description.
 */
export const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Create Flow", description: "" };
    case "read":
      return { heading: "Flow", description: "" };
    case "update":
      return { heading: "Edit Flow", description: "" };
    default:
      return { heading: "", description: "" };
  }
};
