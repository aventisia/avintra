import { maxError, maxLenError, minError, minLenError, reqError } from "@avplatform/ui/utils";
import { ZodBoolean, ZodNumber, ZodString, ZodTypeAny, z } from "zod";

import { DCPFieldSchemaType } from "..";

function applyFieldOptions<T extends ZodString | ZodNumber | ZodBoolean>(
  schema: T,
  {
    name,
    label = "Field",
    defaultValue,
    required,
    min,
    max,
    minLength,
    maxLength,
  }: DCPFieldSchemaType,
): T {
  let newSchema = schema;

  if (newSchema instanceof z.ZodString) {
    if (required) newSchema = newSchema.min(1, { message: reqError(label) }) as T;
    if (minLength !== undefined)
      newSchema = (newSchema as ZodString).min(minLength, {
        message: minLenError(label, minLength),
      }) as T;
    if (maxLength !== undefined)
      newSchema = (newSchema as ZodString).max(maxLength, {
        message: maxLenError(label, maxLength),
      }) as T;
  }

  if (newSchema instanceof z.ZodNumber) {
    if (required) newSchema = newSchema.min(1, { message: reqError(label) }) as T;
    if (min !== undefined)
      newSchema = (newSchema as ZodNumber).min(min, {
        message: minError(label, min),
      }) as T;
    if (max !== undefined)
      newSchema = (newSchema as ZodNumber).max(max, {
        message: maxError(label, max),
      }) as T;
  }

  if (newSchema instanceof z.ZodBoolean) {
    if (required) {
      newSchema = (newSchema as ZodBoolean).refine((val) => val === true, {
        path: [name],
        message: reqError(label),
      }) as unknown as T;
    }
  }

  // Add default value if provided (and not undefined)
  if (defaultValue !== undefined) {
    if (newSchema instanceof z.ZodString && typeof defaultValue === "string") {
      newSchema = (newSchema as ZodString).default(defaultValue) as unknown as T;
    } else if (newSchema instanceof z.ZodNumber && typeof defaultValue === "number") {
      newSchema = (newSchema as ZodNumber).default(defaultValue) as unknown as T;
    } else if (newSchema instanceof z.ZodBoolean && typeof defaultValue === "boolean") {
      newSchema = (newSchema as ZodBoolean).default(defaultValue) as unknown as T;
    }
  }

  return newSchema;
}

function getNodeOutputSchema(field: DCPFieldSchemaType): ZodTypeAny {
  const valueSchema = z.string();
  const enabledSchema = z.boolean().default(true);

  if (
    field.defaultValue &&
    typeof field.defaultValue === "object" &&
    "value" in field.defaultValue &&
    "enabled" in field.defaultValue
  ) {
    if (typeof field.defaultValue.value === "string") {
      valueSchema.default(field.defaultValue.value);
    } else if (typeof field.defaultValue.enabled === "boolean") {
      enabledSchema.default(field.defaultValue.enabled);
    }
  }
  return z.object({
    value: valueSchema,
    enabled: enabledSchema,
  });
}

function getConditionSchema(field: DCPFieldSchemaType): ZodTypeAny {
  // Recursively generate schema for array items
  if (Array.isArray(field.conditionSchema)) {
    const itemShapes: Record<string, ZodTypeAny> = {};
    field.conditionSchema.forEach((subField) => {
      itemShapes[subField.name] = getZodType(subField);
    });
    let arrSchema = z.array(z.object(itemShapes));
    if (field.required) {
      arrSchema = arrSchema.min(1, {
        message: reqError(field.label || "Field"),
      });
    }
    return arrSchema;
  }
  // fallback if schema is missing
  return z.array(z.any());
}

function getZodType(field: DCPFieldSchemaType): ZodTypeAny {
  switch (field.type) {
    case "number":
      return applyFieldOptions(z.number(), field);
    case "checkbox":
    case "switch":
      return applyFieldOptions(z.boolean(), field);
    case "condition-groups":
      return getConditionSchema(field);
    case "config-panel-output":
      return getNodeOutputSchema(field);
    default:
      return applyFieldOptions(z.string(), field); // Fallback to string
  }
}

export function generateZodSchema(
  config: DCPFieldSchemaType[],
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  config.forEach((field) => {
    shape[field.name] = getZodType(field);
  });
  return z.object(shape);
}
