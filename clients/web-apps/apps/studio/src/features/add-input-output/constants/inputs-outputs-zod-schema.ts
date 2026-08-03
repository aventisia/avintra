import { z } from "zod";

// Zod schema for a single field item
const fieldItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[^\s]+$/, "Name must not contain spaces"), // disallows any whitespace
  direction: z.enum(["Input", "Output"]),
  label: z.string().optional(),
  defaultValue: z.string(),
  description: z.string().optional(),
  selectOptions: z.string().optional(),
  type: z.enum(["text", "select", "switch", "password", "config-panel-output"]),
  required: z.boolean().default(false),
});

const outputFieldItemSchema = fieldItemSchema.omit({
  selectOptions: true,
  required: true,
});

// Main form schema
const inputsOutputsFieldsSchema = z.object({
  inputs: z.array(fieldItemSchema).optional(),
  outputs: z.array(outputFieldItemSchema).optional(),
});

export type FieldItemFormValues = z.infer<typeof fieldItemSchema>;

export type OutputFieldFormValues = z.infer<typeof outputFieldItemSchema>;

export type InputsOutputsFieldsFormType = z.infer<typeof inputsOutputsFieldsSchema>;

export { fieldItemSchema, inputsOutputsFieldsSchema };
