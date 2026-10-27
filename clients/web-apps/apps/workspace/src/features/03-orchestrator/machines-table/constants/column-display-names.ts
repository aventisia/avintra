import type { BadgeProps } from "@avplatform/ui/badge";
import { MachineStatusEnum } from "@avplatform/ui/enums/machine-status-enum";
import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "status", value: "Status" },
  { key: "flowVersionCount", value: "Agents" },
  { key: "lastCheckedIn", value: "Last Checked In" },
  { key: "operatingSystem", value: "OS Type" },
  { key: "osID", value: "OS Unique Id" },
  { key: "username", value: "Username" },
  { key: "hostname", value: "Hostname" },
  { key: "isDisabled", value: "Disabled" },
  { key: "linkedUserAccount", value: "Linked User Account" },
  { key: "createdAt", value: "Registered At" },
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
