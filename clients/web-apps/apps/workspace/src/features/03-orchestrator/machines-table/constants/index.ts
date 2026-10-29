import { DialogCrudAction } from "@avplatform/ui/types";

/**
 * The unique key for the machines query to be used in the query client. ["machines"]
 */
const DATA_QUERY_KEY = ["machines"];

/**
 * The heading for the machines table.
 */
const TABLE_HEADING = "Machines";

const TABLE_KEY = "machines";

const getDialogHeadingDescription = (crudAction: DialogCrudAction) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add machine", description: "" };
    case "read":
      return { heading: "Machine", description: "" };
    case "update":
      return { heading: "Edit machine", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export { DATA_QUERY_KEY, getDialogHeadingDescription, TABLE_HEADING, TABLE_KEY };

export const sortAsAssignedFirst = <T extends { isAssigned: boolean; name: string }>(
  a: T,
  b: T,
) => {
  if (a.isAssigned && !b.isAssigned) return -1;
  if (!a.isAssigned && b.isAssigned) return 1;
  return a?.name?.localeCompare(b.name);
};
