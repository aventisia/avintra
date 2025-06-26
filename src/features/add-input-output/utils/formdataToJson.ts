import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";
import {
  FieldItemFormValues,
  InputsOutputsFieldsFormType,
  OutputFieldFormValues,
} from "../constants/inputs-outputs-zod-schema";

export const transformFormDataToDCPJson = (
  formData: InputsOutputsFieldsFormType,
): DCPFieldSchemaType[] => {
  const toCamelCase = (str: string) =>
    str
      .replace(/[^a-zA-Z0-9 ]/g, "") // remove special characters
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase(),
      )
      .replace(/\s+/g, "");

  const transformField = (
    field: FieldItemFormValues | OutputFieldFormValues,
  ): DCPFieldSchemaType => {
    const { direction, type, name, label, description, defaultValue } = field;

    const required = "required" in field ? (field.required ?? false) : false;

    const baseField: DCPFieldSchemaType = {
      direction,
      type,
      name,
      label,
      description,
      defaultValue: transformDefaultValue(type, defaultValue),
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
          value: toCamelCase(opt),
        }));
    }

    return baseField;
  };

  const transformDefaultValue = (type: string, value: unknown): unknown => {
    if (type === "config-panel-output") {
      return {
        value: value || "",
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
