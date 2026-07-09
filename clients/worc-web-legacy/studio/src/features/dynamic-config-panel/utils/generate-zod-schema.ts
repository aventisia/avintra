import {
  maxError,
  maxLenError,
  minError,
  minLenError,
  reqError,
} from "@aventisia/ui/utils";
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
    if (required)
      newSchema = newSchema.min(1, { message: reqError(label) }) as T;
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
    if (required)
      newSchema = newSchema.min(1, { message: reqError(label) }) as T;
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
      newSchema = (newSchema as ZodString).default(
        defaultValue,
      ) as unknown as T;
    } else if (
      newSchema instanceof z.ZodNumber &&
      typeof defaultValue === "number"
    ) {
      newSchema = (newSchema as ZodNumber).default(
        defaultValue,
      ) as unknown as T;
    } else if (
      newSchema instanceof z.ZodBoolean &&
      typeof defaultValue === "boolean"
    ) {
      newSchema = (newSchema as ZodBoolean).default(
        defaultValue,
      ) as unknown as T;
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

function getModelConfigSchema(field: DCPFieldSchemaType): ZodTypeAny {
  // Start by defining the schema without default values
  const isByokEnabledSchema = z.boolean();
  const providerSchema = z.string();
  const credentialsSchema = z.string().optional();
  const modelSchema = z.string();
  const temperatureSchema = z.number();
  const topPSchema = z.number();
  const voiceSchema = z.string().optional();
  const isJsonOutputSchema = z.boolean();
  const maxOutputTokenSchema = z.number();

  // Check if field.defaultValue is an object and contains all expected properties
  if (field.defaultValue && typeof field.defaultValue === "object") {
    // If the structure is valid, apply default values to the schema

    if ("is_byok_enabled" in field.defaultValue) {
      isByokEnabledSchema.default(
        field?.defaultValue?.is_byok_enabled as boolean,
      );
    }
    if ("provider" in field.defaultValue) {
      providerSchema.default(field?.defaultValue?.provider as string);
    }
    if ("model" in field.defaultValue) {
      modelSchema.default(field?.defaultValue?.model as string);
    }
    if ("temperature" in field.defaultValue) {
      temperatureSchema.default(field?.defaultValue?.temperature as number);
    }
    if ("top_p" in field.defaultValue) {
      topPSchema.default(field?.defaultValue?.top_p as number);
    }
    if ("is_json_output" in field.defaultValue) {
      isJsonOutputSchema.default(
        field?.defaultValue?.is_json_output as boolean,
      );
    }

    if ("max_output_tokens" in field.defaultValue) {
      maxOutputTokenSchema.default(
        field?.defaultValue?.max_output_tokens as number,
      );
    }
  }

  // Return the schema at the end
  return z.object({
    is_byok_enabled: isByokEnabledSchema,
    provider: providerSchema,
    credential_id: credentialsSchema,
    model: modelSchema,
    temperature: temperatureSchema,
    top_p: topPSchema,
    voice: voiceSchema,
    is_json_output: isJsonOutputSchema,
    max_output_tokens: maxOutputTokenSchema,
  });
}

function getToolsConfigSchema(field: DCPFieldSchemaType): ZodTypeAny {
  const actionItemSchema = z.object({
    approval: z.string().default("human"),
    action: z.string().min(1, "Action name is required"),
  });

  const toolConfigSchema = z.object({
    tool: z.string().min(1, "Tool is required"),
    credential_id: z.string().min(1, "Credential ID is required"),
    actions: z
      .array(actionItemSchema)
      .min(1, "At least one action must be selected"),
  });

  let schema: ZodTypeAny = z.array(toolConfigSchema);

  if (field?.defaultValue && Array.isArray(field.defaultValue)) {
    schema = schema.default(field.defaultValue);
  } else {
    schema = schema.default([]);
  }

  return schema;
}

function getStringArraySchema(field: DCPFieldSchemaType): ZodTypeAny {
  let schema: ZodTypeAny = z.array(z.string());

  if (field?.defaultValue && Array.isArray(field.defaultValue)) {
    schema = schema.default(field.defaultValue);
  } else {
    schema = schema.default([]);
  }

  return schema;
}

function getSuggestionsSchema(field: DCPFieldSchemaType): ZodTypeAny {
  let defaultActionsSchema: ZodTypeAny = z.array(z.string());
  let enableDynamicActionsSchema: ZodTypeAny = z.boolean();
  let followUpMessagePromptSchema: ZodTypeAny = z.string();

  if (field.defaultValue && typeof field.defaultValue === "object") {
    if ("defaultActions" in field.defaultValue) {
      defaultActionsSchema = z
        .array(z.string())
        .default(field.defaultValue.defaultActions as string[]);
    }

    if ("enableDynamicActions" in field.defaultValue) {
      enableDynamicActionsSchema = z
        .boolean()
        .default(field.defaultValue.enableDynamicActions as boolean);
    }

    if ("followUpMessagePrompt" in field.defaultValue) {
      followUpMessagePromptSchema = z
        .string()
        .default(field.defaultValue.followUpMessagePrompt as string);
    }
  }

  return z.object({
    defaultActions: defaultActionsSchema,
    enableDynamicActions: enableDynamicActionsSchema,
    followUpMessagePrompt: followUpMessagePromptSchema,
  });
}
function getVoiceConfigSchema(field: DCPFieldSchemaType): ZodTypeAny {
  // 1. Explicitly type variables as ZodTypeAny so they can accept the ZodDefault wrapper later
  let languageSchema: ZodTypeAny = z.string();
  let voiceSchema: ZodTypeAny = z.string();
  let speedSchema: ZodTypeAny = z.number().min(0.25).max(4.0);
  // let pitchSchema: ZodTypeAny = z.number().min(0.5).max(2.0);

  // 2. Reassign the variables with the newly generated default schemas
  if (field.defaultValue && typeof field.defaultValue === "object") {
    if ("language" in field.defaultValue) {
      languageSchema = z
        .string()
        .default(field.defaultValue.language as string);
    }

    if ("voice" in field.defaultValue) {
      voiceSchema = z.string().default(field.defaultValue.voice as string);
    }

    if ("speed" in field.defaultValue) {
      speedSchema = z
        .number()
        .min(0.25)
        .max(4.0)
        .default(field.defaultValue.speed as number);
    }

    // if ("pitch" in field.defaultValue) {
    //   pitchSchema = z
    //     .number()
    //     .min(0.5)
    //     .max(2.0)
    //     .default(field.defaultValue.pitch as number);
    // }
  }

  // 3. Return the final object
  return z.object({
    language: languageSchema,
    voice: voiceSchema,
    speed: speedSchema,
    // pitch: pitchSchema,
  });
}

function getKnowledgeBaseConfigSchema(field: DCPFieldSchemaType): ZodTypeAny {
  // Start by defining the schema without default values
  const knowledgeBaseSchema = z.preprocess((val) => {
    if (Array.isArray(val)) {
      return val;
    }

    if (typeof val === "string") {
      return val
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [];
  }, z.array(z.string()));
  const retrievalTypeSchema = z.string();
  const sourceThresholdSchema = z.number();
  const numberOfChunksSchema = z.number();

  // Check if field.defaultValue is an object and contains all expected properties
  if (field.defaultValue && typeof field.defaultValue === "object") {
    // If the structure is valid, apply default values to the schema

    if ("knowledgeBase" in field.defaultValue) {
      const defaultKnowledgeBase = field?.defaultValue?.knowledgeBase;
      const normalizedKnowledgeBase = Array.isArray(defaultKnowledgeBase)
        ? defaultKnowledgeBase
        : typeof defaultKnowledgeBase === "string"
          ? defaultKnowledgeBase
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [];

      knowledgeBaseSchema.default(normalizedKnowledgeBase as string[]);
    }
    if ("retrievalType" in field.defaultValue) {
      retrievalTypeSchema.default(field?.defaultValue?.retrievalType as string);
    }
    if ("sourceThreshold" in field.defaultValue) {
      sourceThresholdSchema.default(
        field?.defaultValue?.sourceThreshold as number,
      );
    }
    if ("numberOfChunks" in field.defaultValue) {
      numberOfChunksSchema.default(
        field?.defaultValue?.numberOfChunks as number,
      );
    }
  }

  // Return the schema at the end
  return z.object({
    knowledgeBase: knowledgeBaseSchema,
    numberOfChunks: numberOfChunksSchema,
    retrievalType: retrievalTypeSchema,
    sourceThreshold: sourceThresholdSchema,
  });
}

function getMemoryConfigSchema(field: DCPFieldSchemaType): ZodTypeAny {
  // Start by defining the schema without default values
  const memoryProviderSchema = z.string();
  const maxDataStoredSchema = z.number();

  // Check if field.defaultValue is an object and contains all expected properties
  if (field.defaultValue && typeof field.defaultValue === "object") {
    // If the structure is valid, apply default values to the schema

    if ("memoryProvider" in field.defaultValue) {
      memoryProviderSchema.default(
        field?.defaultValue?.memoryProvider as string,
      );
    }
    if ("maxDataStored" in field.defaultValue) {
      maxDataStoredSchema.default(field?.defaultValue?.maxDataStored as number);
    }
  }

  // Return the schema at the end
  return z.object({
    memoryProvider: memoryProviderSchema,
    maxDataStored: maxDataStoredSchema,
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

function getQueueConditionalGroupSchema(field: DCPFieldSchemaType): ZodTypeAny {
  if (!Array.isArray(field.conditionSchema)) {
    return z.array(z.any());
  }

  // Build object shape dynamically from conditionSchema
  const itemShapes: Record<string, ZodTypeAny> = {};

  field.conditionSchema.forEach((subField) => {
    itemShapes[subField.name] = getZodType(subField);
  });

  const conditionObject = z.object(itemShapes);

  let arrSchema = z.array(conditionObject);

  if (field.required) {
    arrSchema = arrSchema.min(1, {
      message: reqError(field.label || "Conditions"),
    });
  }

  return arrSchema;
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
    case "model-config-select":
      return getModelConfigSchema(field);
    case "voice-config-select":
      return getVoiceConfigSchema(field);
    case "knowledge-base-config":
      return getKnowledgeBaseConfigSchema(field);
    case "memory-config":
      return getMemoryConfigSchema(field);
    case "queue-conditional-group":
    case "queue-priority-group":
      return getQueueConditionalGroupSchema(field);
    case "tools-config-select":
      return getToolsConfigSchema(field);
    case "string-array":
      return getStringArraySchema(field);
    case "suggestions":
      return getSuggestionsSchema(field);
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
