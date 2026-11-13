import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";

import {
  FieldItemFormValues,
  InputsOutputsFieldsFormType,
  OutputFieldFormValues,
} from "../constants/inputs-outputs-zod-schema";

export const DCPJsonToFormData = (data: DCPFieldSchemaType[]): InputsOutputsFieldsFormType => {
  const toLabel = (str: string) =>
    str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();

  const transformField = (
    field: DCPFieldSchemaType,
  ): FieldItemFormValues | OutputFieldFormValues => {
    const { direction, type, name, label, description, defaultValue, required, selectOptions } =
      field;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseField: any = {
      direction,
      type,
      name,
      label: direction === "Output" ? name : (label ?? toLabel(name)),
      description: description ?? "",
      defaultValue: transformDefaultValueFromAPI(type, defaultValue),
    };

    if (direction === "Input") {
      baseField.required = required ?? false;

      if (type === "select" && Array.isArray(selectOptions)) {
        baseField.selectOptions = selectOptions.map((opt) => opt.label).join(";");
      }
    }

    return baseField;
  };

  const transformDefaultValueFromAPI = (type: string, value: unknown): unknown => {
    if (type === "config-panel-output" && typeof value === "object" && value) {
      return (value as { value: string }).value || "";
    }
    if (type === "switch") {
      return String(value === true || value === "true");
    }
    return value ?? "";
  };

  const inputs = data
    .filter((item) => item.direction === "Input")
    .map(transformField) as FieldItemFormValues[];

  const outputs = data
    .filter((item) => item.direction === "Output")
    .map(transformField) as OutputFieldFormValues[];

  return { inputs, outputs };
};
