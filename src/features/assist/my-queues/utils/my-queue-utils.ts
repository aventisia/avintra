import { InputSchemaField } from "../dtos/queues-table-dto";
import { TabValue } from "../types/my-queue-types";

export const filterByTabStatus = (tab: TabValue, status?: string) => {
  if (!status) return false;

  switch (tab) {
    case "Pending":
      return status === "Pending";
    case "In Progress":
      return status === "InProgress";
    case "History":
      return ["Completed", "Failed"].includes(status);
    default:
      return false;
  }
};

export const generateColumnVisibility = (
  fields: InputSchemaField[],
): Record<string, boolean> =>
  Object.fromEntries(fields.map((f) => [f.name, true]));
