import { KeyValueLookupType } from "@avplatform/ui/types";

export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select row" },
  { key: "ticketNumber", value: "Ticket number" },
  { key: "requestType", value: "Type" },
  { key: "title", value: "Title" },
  { key: "status", value: "Status" },
  { key: "agentName", value: "Agent" },
  { key: "createdBy", value: "Created by" },
  { key: "createdOn", value: "Created on" },
  { key: "commentCount", value: "Total comments" },
  { key: "attachmentCount", value: "Total attachments" },
];

export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
