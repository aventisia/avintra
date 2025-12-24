import { DCPFieldSchemaType } from "../types/dcp-field-schema-type";
import { RenderItem } from "../types/render-fields-type";

/**
 * Groups fields by `groupName` while preserving order.
 *
 * Assumptions:
 * - Fields are already filtered and renderable
 * - Grouping is inferred purely from `groupName`
 *
 */
export function groupFields(fields: DCPFieldSchemaType[]): RenderItem[] {
  return fields.reduce<RenderItem[]>((acc, field) => {
    // Ungrouped field render as-is
    if (!field.groupName) {
      acc.push(field);
      return acc;
    }

    const last = acc[acc.length - 1];

    // Append to existing group if possible
    if (last && "fields" in last && last.groupName === field.groupName) {
      last.fields.push(field);
    } else {
      // Start a new group
      acc.push({
        groupName: field.groupName,
        fields: [field],
      });
    }

    return acc;
  }, []);
}
