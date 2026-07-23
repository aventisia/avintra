import { KeyValueLookupType } from "@avplatform/ui/types";

export const AdminRoleTableColumnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },
  { key: "name", value: "Role Name" },
  { key: "description", value: "Description" },
  { key: "users", value: "Users" },
  { key: "createdBy", value: "Created By" },
  { key: "lastUpdatedBy", value: "Updated By" },
  { key: "totalPermission", value: "Total Permissions" },
  { key: "createdOn", value: "Created On" },
  { key: "lastUpdatedOn", value: "Last Updated On" },
  { key: "isDefault", value: "Is Default" },
];

export const getColumnName = (key: string): string => {
  const column = AdminRoleTableColumnDisplayNames.find((column) => column.key === key);

  return column?.value || key;
};
