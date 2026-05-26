import { KeyValueLookupType } from "@aventisia/ui/types";

import { MachineStatusTypesEnum } from "@/react-toolkit/enums/machine-status-types-enum";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Name" },
  { key: "ipAddress", value: "IP Address" },
  { key: "hostname", value: "Hostname/Username" },
  { key: "type", value: "OS Type" },
  { key: "environment", value: "Environment" },
  { key: "agentCount", value: "Agents" },
  { key: "status", value: "Status" },
  { key: "lastModifiedOn", value: "Last Checked In" },
  { key: "createdBy", value: "Added By" },
  { key: "createdOn", value: "Added On" },
];

// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};

export const statusColor: { [key in MachineStatusTypesEnum]: string } = {
  [MachineStatusTypesEnum.Online]: "bg-green-200 text-green-700",
  [MachineStatusTypesEnum.Offline]: "bg-slate-200 text-slate-600",
  [MachineStatusTypesEnum.Idle]: "bg-orange-200 text-orange-600",
  [MachineStatusTypesEnum.Running]: "bg-primary",
  [MachineStatusTypesEnum.Stopped]: "bg-red-200 text-red-600",
};
