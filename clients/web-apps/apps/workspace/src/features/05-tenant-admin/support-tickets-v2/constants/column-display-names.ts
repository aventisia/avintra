import { KeyValueLookupType } from "@avplatform/ui/types";

export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select Row" },
  { key: "ticketNumber", value: "Ticket Number" },
  { key: "requestType", value: "Type" },
  { key: "title", value: "Title" },
  { key: "status", value: "Status" },
  { key: "createdBy", value: "Created By" },
  { key: "createdOn", value: "Created On" },
  { key: "commentCount", value: "Total Comments" },
  { key: "attachmentCount", value: "Total Attachments" },
];

export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
