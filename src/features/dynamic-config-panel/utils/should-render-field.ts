import { DCPFieldSchemaType } from "..";

/**
 * Checks if a field should be rendered based on renderIf conditions and current form values.
 * @param renderIf - The renderIf object from field config.
 * @param values - The current form values (object).
 * @returns boolean - true if the field should be rendered, false otherwise.
 */
export function shouldRenderField(
  section: "Input" | "Output",
  { direction, renderIf }: DCPFieldSchemaType,
  formValues: Record<string, unknown>,
): boolean {
  // Check field direction
  if (direction !== section) return false; // Field direction does not match

  // If renderIf is not defined, always render the field
  if (!renderIf || !renderIf.conditions || renderIf.conditions.length === 0) {
    return true; // No conditions, always render
  }

  // If formValues are not provided, assume field should be rendered
  if (!formValues || Object.keys(formValues).length === 0) {
    return true; // No form values, always render
  }

  // Get conditions and operator from renderIf
  const { conditions, _operator } = renderIf;

  const results = conditions.map((cond) =>
    typeof cond == "object" && "equals" in cond
      ? formValues[cond.field] === cond.equals
      : formValues[cond.field] !== cond.notEquals,
  );

  return _operator === "AND" ? results.every(Boolean) : results.some(Boolean);
}
