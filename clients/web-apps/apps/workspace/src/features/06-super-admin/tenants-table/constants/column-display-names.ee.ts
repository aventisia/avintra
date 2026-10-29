import { KeyValueLookupType } from "@avplatform/ui/types";

/** Array of column names and their corresponding display names. */
export const columnDisplayNames: KeyValueLookupType[] = [
  { key: "id", value: "Select row" },

  //  Core
  { key: "name", value: "Name" },
  { key: "type", value: "Type" },
  { key: "currency", value: "Currency" },
  { key: "resourceType", value: "Resource type" },
  { key: "activePlan", value: "Plan" },

  //  Dates
  { key: "effectiveDate", value: "Effective date" },
  { key: "renewalDate", value: "Renewal date" },
  { key: "expiresOn", value: "Expires on" },

  //  Business
  { key: "domain", value: "Domain" },
  { key: "country", value: "Country" },
  { key: "numberOfEmployees", value: "Employees" },
  { key: "industry", value: "Industry" },

  //  Usage / Metrics
  { key: "totalUsers", value: "Users" },
  { key: "availableCredits", value: "Available credits" },
  { key: "consumedCredits", value: "Consumed credits" },
  { key: "totalExecutionTime", value: "Execution time" },
  { key: "storageSize", value: "Storage" },
  { key: "publishAgent", value: "Publish agent" },
  { key: "totalJobs", value: "Jobs" },
  { key: "lastLoginDate", value: "Last login date" },

  //  Flags
  { key: "isDisabled", value: "Disabled" },

  //  Audit
  { key: "createdOn", value: "Created on" },
  { key: "createdBy", value: "Created by" },
  { key: "lastModifiedOn", value: "Last modified on" },
  { key: "lastModifiedBy", value: "Last modified by" },
];
// Get the column display name for the given column key.
export const getColumnName = (key: string): string => {
  const column = columnDisplayNames.find((column) => column.key === key);
  return column?.value ?? key;
};
