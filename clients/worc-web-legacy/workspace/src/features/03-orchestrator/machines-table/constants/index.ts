import { CrudActionType } from "@aventisia/ui/types";

/**
 * The unique key for the machines query to be used in the query client. ["machines"]
 */
const DATA_QUERY_KEY = ["machines"];

/**
 * The heading for the machines table.
 */
const TABLE_HEADING = "Machines";

const TABLE_KEY = "machines";

const getDialogHeadingDescription = (crudAction: CrudActionType) => {
  switch (crudAction) {
    case "create":
      return { heading: "Add Machine", description: "" };
    case "read":
      return { heading: "Machine", description: "" };
    case "update":
      return { heading: "Edit Machine", description: "" };
    default:
      return { heading: "", description: "" };
  }
};

export {
  DATA_QUERY_KEY,
  getDialogHeadingDescription,
  TABLE_HEADING,
  TABLE_KEY,
};

export const sortAsAssignedFirst = <
  T extends { isAssigned: boolean; name: string },
>(
  a: T,
  b: T,
) => {
  if (a.isAssigned && !b.isAssigned) return -1;
  if (!a.isAssigned && b.isAssigned) return 1;
  return a?.name?.localeCompare(b.name);
};

// Regular expressions for IPv4 and IPv6 validation
export const ipv4Regex =
  /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

export const ipv6Regex =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

export const maskIP = (input: string) =>
  input.length < 4
    ? "*****"
    : `${input.slice(0, 2)}${"*".repeat(input.length - 4)}${input.slice(-2)}`;
