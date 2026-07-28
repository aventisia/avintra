import { DCPFieldSchemaType } from "./dcp-field-schema-type";

export type NodeConfigSchemaType = {
  name?: string;
  label?: string;
  description?: string;
  version?: string;
  auther?: string;
  supportedPlatforms?: string[];
  errorHandling?: "standard" | "none";
  testScreenType?: "standard" | "none" | "llmGenerateRequest";
  fields: DCPFieldSchemaType[];
};
