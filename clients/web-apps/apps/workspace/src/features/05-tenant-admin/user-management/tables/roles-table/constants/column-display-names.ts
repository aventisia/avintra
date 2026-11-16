import { KeyValueLookupType } from "@avplatform/ui/types";

export const AdminRoleTableColumnDisplayNames: KeyValueLookupType[] = [
  { key: "select", value: "Select row" },
  { key: "id", value: "Select row" },
  { key: "name", value: "Role name" },
  { key: "fullName", value: "Role name" },
  { key: "description", value: "Description" },
  { key: "users", value: "Users" },
  { key: "createdBy", value: "Created by" },
  { key: "lastUpdatedBy", value: "Updated by" },
  { key: "totalPermission", value: "Total permissions" },
  { key: "createdOn", value: "Created on" },
  { key: "lastUpdatedOn", value: "Last updated on" },
  { key: "isDefault", value: "Is default" },
];

export const getColumnName = (key: string): string => {
  const column = AdminRoleTableColumnDisplayNames.find((column) => column.key === key);

  return column?.value || key;
};
