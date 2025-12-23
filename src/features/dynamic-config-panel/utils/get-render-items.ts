import { DCPFieldSchemaType } from "../types/dcp-field-schema-type";
import { RenderItem } from "../types/render-fields-type";
import { shouldRenderField } from "./should-render-field";

/**
 * Returns an array of RenderItem (grouped and ungrouped fields) for a specific tab
 */
export function getRenderItems(
  fields: DCPFieldSchemaType[],
  tab: string,
  watchedValues: Record<string, unknown>,
  inputKeys: string[],
): RenderItem[] {
  return (
    fields
      // get fields that belong to the specified tab
      .filter((field) => (field.category ?? "Inputs") === tab)
      .reduce<RenderItem[]>((acc, field) => {
        // Skip fields that should not be rendered
        if (!shouldRenderField("Input", field, watchedValues)) {
          const idx = inputKeys.indexOf(field.name);
          if (idx !== -1) inputKeys.splice(idx, 1);
          return acc;
        }

        // Track field names for form values
        if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

        // Handle grouped fields
        if (field.groupName) {
          const last = acc[acc.length - 1];
          if (last && "fields" in last && last.groupName === field.groupName) {
            last.fields.push(field);
          } else {
            acc.push({
              groupName: field.groupName,
              fields: [field],
            });
          }
          return acc;
        }

        // Handle single/ungrouped fields
        acc.push(field);
        return acc;
      }, [])
  );
}
