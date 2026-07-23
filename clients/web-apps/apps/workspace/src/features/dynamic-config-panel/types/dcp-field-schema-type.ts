import { ISelectOption } from "@avplatform/ui/types";

import { DCPControlType, RenderIfType } from "..";

/**
 * Describes the schema for a single form field used in dynamic configuration panels.
 *
 * @property type - The type of control to render for this field.
 * @property name - The unique name of the field, used for form registration.
 * @property label - The display label for the field.
 * @property defaultValue - The initial value of the field.
 * @property description - Optional description or helper text for the field.
 * @property selectOptions - Options for select, multi-selector, or radio field types.
 * @property className - Optional CSS class for custom styling.
 * @property placeholder - Placeholder text for the field input.
 * @property disabled - If true, the field is disabled and cannot be interacted with.
 * @property readonly - If true, the field is read-only.
 * @property required - If true, the field must be filled out before form submission.
 * @property min - Minimum value for number fields.
 * @property max - Maximum value for number fields.
 * @property minLength - Minimum length for string fields.
 * @property maxLength - Maximum length for string fields.
 */
export type DCPFieldSchemaType = {
  type: DCPControlType;
  name: string;
  direction: "Input" | "Output"; // Not a html attribute
  label?: string; // Not a html attribute
  defaultValue: unknown; // Not a html attribute
  description?: string; // Not a html attribute
  selectOptions?: ISelectOption[]; // Not a html attribute
  conditionSchema?: DCPFieldSchemaType[]; // Not a html attribute (For condition array types)
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  renderIf?: RenderIfType; // Not a html attribute
};
