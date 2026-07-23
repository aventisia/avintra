import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select Row" },

  //  Core
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "currency", value: "Currency" },
  { key: "resourceType", value: "Resource Type" },
  { key: "activePlan", value: "Plan" },

  //  Dates
  { key: "effectiveDate", value: "Effective Date" },
  { key: "renewalDate", value: "Renewal Date" },
  { key: "expiresOn", value: "Expires On" },

  //  Business
  { key: "domain", value: "Domain" },
  { key: "country", value: "Country" },
  { key: "numberOfEmployees", value: "Employees" },
  { key: "industry", value: "Industry" },

  //  Usage / Metrics
  { key: "totalUsers", value: "Users" },
  { key: "availableCredits", value: "Available Credits" },
  { key: "consumedCredits", value: "Consumed Credits" },
  { key: "totalExecutionTime", value: "Execution Time" },
  { key: "storageSize", value: "Storage" },
  { key: "publishAgent", value: "Publish Agent" },
  { key: "totalJobs", value: "Jobs" },

  //  Flags
  { key: "isDisabled", value: "Disabled" },

  //  Audit
  { key: "createdOn", value: "Created On" },
  { key: "createdBy", value: "Created By" },
  { key: "lastModifiedOn", value: "Last Modified On" },
  { key: "lastModifiedBy", value: "Last Modified By" },
];
// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
