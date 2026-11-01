import type { BadgeProps } from "@avplatform/ui/badge";
import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "name", value: "Name" },
  { key: "status", value: "Status" },
  { key: "flowVersionCount", value: "Agents" },
  { key: "lastCheckedIn", value: "Last checked in" },
  { key: "operatingSystem", value: "OS type" },
  { key: "osID", value: "OS unique ID" },
  { key: "username", value: "Username" },
  { key: "hostname", value: "Hostname" },
  { key: "isDisabled", value: "Disabled" },
  { key: "linkedUserAccount", value: "Linked user account" },
  { key: "createdAt", value: "Registered at" },
  { key: "id", value: "Machine ID" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusVariant: { [key in MachineStatusEnum]: BadgeProps["variant"] } = {
  [MachineStatusEnum.Online]: "completed",
  [MachineStatusEnum.Offline]: "secondary",
  [MachineStatusEnum.Idle]: "queued",
  [MachineStatusEnum.Running]: "running",
  [MachineStatusEnum.Stopped]: "failed",
};
