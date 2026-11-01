import type { BadgeProps } from "@avplatform/ui/badge";
import { KeyValueLookupType } from "@avplatform/ui/types";

import { ConversationStatusEnum } from "../enums/conversation-status-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "title", value: "Conversation" },
  { key: "flowName", value: "Agent" },
  { key: "totalExchange", value: "Exchanges" },
  { key: "status", value: "Status" },
  { key: "username", value: "User" },
  { key: "timestamp", value: "Last activity" },
  { key: "lastModifiedBy", value: "User" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusVariant: { [key in ConversationStatusEnum]: BadgeProps["variant"] } = {
  [ConversationStatusEnum.Active]: "running",
  [ConversationStatusEnum.Archived]: "secondary",
  [ConversationStatusEnum.Completed]: "completed",
  [ConversationStatusEnum.AccessRevoked]: "secondary",
  [ConversationStatusEnum.Failed]: "failed",
};
