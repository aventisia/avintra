import { TEMPLATE_TYPES } from "../constants/library.constant";
import { PromptTemplateSchema } from "../types/prompt-template-schema-type";

const FUNCTION_ICON = "/function.png";

export const getTemplateType = (type?: string) =>
  TEMPLATE_TYPES.find((option) => option.value === type);

export const getTemplateTypeLabel = (type?: string) => getTemplateType(type)?.label ?? type ?? "";

export const getTemplateAccessLabel = (accessType?: string) =>
  accessType === "Public" ? "Public" : "Tenant";

/** Integration icon URLs of a template, without the generic function icon. */
export const getTemplateIconUrls = (icons?: string[]) =>
  (icons ?? [])
    .filter((icon) => icon !== FUNCTION_ICON)
    .map((icon) => import.meta.env.VITE_WORKSPACE_PATH + icon);

export const parseTemplateSchema = (schema?: string): PromptTemplateSchema | null => {
  try {
    return schema ? (JSON.parse(schema) as PromptTemplateSchema) : null;
  } catch {
    return null;
  }
};
