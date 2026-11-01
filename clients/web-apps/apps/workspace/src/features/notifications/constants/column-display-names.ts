import { KeyValueLookupType } from "@avplatform/ui/types";

export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "title", value: "Title" },
  { key: "message", value: "Message" },
  { key: "type", value: "Type" },
  { key: "status", value: "Status" },
  { key: "recipientCount", value: "Recipients" },
  { key: "createdOn", value: "Created on" },
];

export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
