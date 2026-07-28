import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import {
  FieldItemFormValues,
  InputsOutputsFieldsFormType,
  OutputFieldFormValues,
} from "../constants/inputs-outputs-zod-schema";

export const formDataToDCPJson = (
  formData: InputsOutputsFieldsFormType,
): DCPFieldSchemaType[] => {
  const transformField = (
    field: FieldItemFormValues | OutputFieldFormValues,
  ): DCPFieldSchemaType => {
    const { direction, type, name, label, description, defaultValue } = field;

    const required = "required" in field ? (field.required ?? false) : false;

    const baseField: DCPFieldSchemaType = {
      direction,
      type,
      name,
      label: direction === "Output" ? name : label, // Set label to name for Output fields
      description,
      defaultValue: transformDefaultValue(type, defaultValue, name),
      required,
    };

    // If it's an Input with select options
    if (type === "select" && "selectOptions" in field && field.selectOptions) {
      baseField.selectOptions = field.selectOptions
        .split(";")
        .map((opt: string) => opt.trim())
        .filter((opt: string) => opt.length > 0)
        .map((opt: string) => ({
          label: opt,
          value: opt, // value and label should be the same
        }));
    }

    return baseField;
  };

  const transformDefaultValue = (
    type: string,
    value: unknown,
    name: string,
  ): unknown => {
    if (type === "config-panel-output") {
      return {
        value: value || name, // output field's default value should be the name
        enabled: true,
      };
    }
    if (type === "switch") {
      return value === true || value === "true";
    }
    return value ?? "";
  };

  const inputs = (formData.inputs || []).map(transformField);
  const outputs = (formData.outputs || []).map(transformField);

  return [...inputs, ...outputs];
};
