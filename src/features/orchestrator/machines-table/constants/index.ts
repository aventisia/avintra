import { CrudActionType } from "@/react-toolkit/types/literal-types";
import type { SelectAgentTableDto } from "../dtos/select-agent-table-dto";

/**
 * The unique key for the machines query to be used in the query client. ["machines"]
 */
const DATA_QUERY_KEY = ["machines"];

/**
 * The heading for the machines table.
 */
const TABLE_HEADING = "Machines";

/**
 * The column used for searching in the machines.
 */
const SEARCH_COLUMN = "name";

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
  SEARCH_COLUMN,
  TABLE_HEADING,
};

export const sortAsAssignedFirst = (a: SelectAgentTableDto, b: SelectAgentTableDto) => {
  if (a.isAssigned && !b.isAssigned) return -1
  if (!a.isAssigned && b.isAssigned) return 1
  return a.name.localeCompare(b.name)
}

// Regular expressions for IPv4 and IPv6 validation
export const ipv4Regex = /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

export const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;



export const maskIP = (ip: string) => {
  const isIPv4 = ip.split(".").length === 4;
  const isIPv6 = ip.includes(":");

  console.log(ip)

  if (isIPv4) {
    return maskIPv4(ip); // Mask IPv4 addresses
  } else if (isIPv6) {
    return maskIPv6(ip); // Mask IPv6 addresses
  }

  else return "*********"
}


// Utility function to mask an IPv4 address
export const maskIPv4 = (ip: string, maskLastOctets: number = 2): string => {
  const octets = ip.split("."); // Split the IP into its four octets
  if (octets.length !== 4) return ip; // Invalid IP format

  // Replace the specified number of octets with "*"
  for (let i = octets.length - maskLastOctets; i < octets.length; i++) {
    octets[i] = "*";
  }

  return octets.join("."); // Join the octets back together
};

// Utility function to mask an IPv6 address
export const maskIPv6 = (ip: string, maskLastSegments: number = 2): string => {
  const segments = ip.split(":"); // Split the IP into its segments
  if (segments.length < 3 || segments.length > 8) return ip; // Invalid IP format

  // Replace the specified number of segments with "****"
  for (let i = segments.length - maskLastSegments; i < segments.length; i++) {
    segments[i] = "****";
  }

  return segments.join(":"); // Join the segments back together
};