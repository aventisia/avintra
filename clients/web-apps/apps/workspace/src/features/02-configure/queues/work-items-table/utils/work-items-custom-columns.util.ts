import { InputSchemaField } from "../../queues-table/dtos/queues-table-dto";
import { QueueWorkItemDto } from "../dtos/queue-work-item-dto";

export type WorkItemsTableRow = QueueWorkItemDto & { customData?: Record<string, unknown> };

export const tableCustomFields = (fields?: InputSchemaField[] | null): InputSchemaField[] =>
  (fields ?? []).filter((field) => field.type?.toLowerCase() !== "array");

export const customColumnId = (field: InputSchemaField): string => `custom-${field.name}`;

export const customFieldLabel = (field: InputSchemaField): string => field.label || field.name;

export const parseWorkItemData = (workItemData?: string | null): Record<string, unknown> => {
  if (!workItemData) return {};

  try {
    const parsed: unknown = JSON.parse(workItemData);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};
