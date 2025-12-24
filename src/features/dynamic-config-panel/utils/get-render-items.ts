import { DCPFieldSchemaType } from "../types/dcp-field-schema-type";
import { RenderItem } from "../types/render-fields-type";
import { getRenderableFields } from "./get-renderable-fields";
import { groupFields } from "./group-fields";

/**
 * Returns renderable items for a tab.
 *
 * Runtime behavior:
 * - If no field has `groupName` → returns flat field array
 * - If grouping is detected → returns grouped RenderItems
 *
 * This keeps non-grouped forms on the fast path
 * while enabling grouping where required.
 */
export function getRenderItems(
  fields: DCPFieldSchemaType[],
  tab: string,
  watchedValues: Record<string, unknown>,
  inputKeys: string[],
): RenderItem[] {
  const renderableFields = getRenderableFields(
    fields,
    tab,
    watchedValues,
    inputKeys,
  );

  const hasGrouping = renderableFields.some((field) => !!field.groupName);

  return hasGrouping ? groupFields(renderableFields) : renderableFields;
}
