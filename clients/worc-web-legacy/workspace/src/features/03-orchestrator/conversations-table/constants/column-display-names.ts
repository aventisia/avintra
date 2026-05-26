import { KeyValueLookupType } from "@aventisia/ui/types";

import { ConversationStatusEnum } from "../enums/conversation-status-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "title", value: "Conversation" },
  { key: "flowName", value: "Agent" },
  { key: "totalExchange", value: "Exchanges" },
  { key: "status", value: "Status" },
  { key: "username", value: "User" },
  { key: "timestamp", value: "Last Activity" },
  { key: "lastModifiedBy", value: "User" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusColor: { [key in ConversationStatusEnum]: string } = {
  [ConversationStatusEnum.Active]: "bg-green-200 text-green-700",
  [ConversationStatusEnum.Archived]: "bg-slate-200 text-slate-600",
  [ConversationStatusEnum.Completed]: "bg-orange-200 text-orange-600",
  [ConversationStatusEnum.AccessRevoked]: "bg-slate-200 text-slate-600",
  [ConversationStatusEnum.Failed]: "bg-red-200 text-red-600",
};
