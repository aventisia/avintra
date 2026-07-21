import { KeyValueLookupType } from "@aventisia/ui/types";

import { MachineStatusEnum } from "@/react-toolkit/enums/machine-status-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "selectRow", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "status", value: "Status" },
  { key: "flowVersionCount", value: "Agents" },
  { key: "lastCheckedIn", value: "Last Checked In" },
  { key: "environment", value: "Environment" },
  { key: "operatingSystem", value: "OS Type" },
  { key: "osID", value: "OS Unique Id" },
  { key: "username", value: "Username" },
  { key: "hostname", value: "Hostname" },
  { key: "isDisabled", value: "Disabled" },
  { key: "ipAddress", value: "IP Address" },
  { key: "createdBy", value: "Added By" },
  { key: "createdOn", value: "Added At" },
  { key: "lastModifiedBy", value: "Last Modified By" },
  { key: "lastModifiedOn", value: "Last Modified At" },
  { key: "id", value: "Machine ID" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusColor: { [key in MachineStatusEnum]: string } = {
  [MachineStatusEnum.Online]: "bg-green-200 text-green-700",
  [MachineStatusEnum.Offline]: "bg-slate-200 text-slate-600",
  [MachineStatusEnum.Idle]: "bg-orange-200 text-orange-600",
  [MachineStatusEnum.Running]: "bg-primary",
  [MachineStatusEnum.Stopped]: "bg-red-200 text-red-600",
};
