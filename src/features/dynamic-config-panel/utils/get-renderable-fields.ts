import { DCPFieldSchemaType } from "../types/dcp-field-schema-type";
import { shouldRenderField } from "./should-render-field";

/**
 * Returns fields that should be rendered for a given tab.
 *
 * Responsibilities:
 * - Filter fields by tab (category)
 * - Apply renderIf / conditional logic
 * - Keep inputKeys in sync with rendered fields
 *
 * NOTE:
 * This function intentionally DOES NOT handle grouping.
 * Grouping is a rendering concern and is handled separately.
 */
export function getRenderableFields(
  fields: DCPFieldSchemaType[],
  tab: string,
  watchedValues: Record<string, unknown>,
  inputKeys: string[],
): DCPFieldSchemaType[] {
  return fields.filter((field) => {
    // Skip fields not belonging to the current tab
    if ((field.category ?? "Inputs") !== tab) return false;

    // Skip fields that fail render conditions
    if (!shouldRenderField("Input", field, watchedValues)) {
      const idx = inputKeys.indexOf(field.name);
      if (idx !== -1) inputKeys.splice(idx, 1);
      return false;
    }

    // Track rendered input fields
    if (!inputKeys.includes(field.name)) {
      inputKeys.push(field.name);
    }

    return true;
  });
}
