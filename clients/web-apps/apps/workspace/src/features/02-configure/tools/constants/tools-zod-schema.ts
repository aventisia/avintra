import { maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { ComponentTypeEnum } from "../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";

export const toolNameSchema = z
  .string()
  .min(1, { message: reqError("Tool name") })
  .max(255, { message: maxLenError("Tool name", 255) });

export const toolBaseUrlSchema = z
  .string()
  .min(1, { message: reqError("Base URL") })
  .max(1000, { message: maxLenError("Base URL", 1000) })
  .url({ message: "Base URL must be a valid URL" });

export const toolZodSchema = z.object({
  id: z.string().optional(),
  name: toolNameSchema,
  code: z
    .string()
    .max(100, { message: maxLenError("Tool code", 100) })
    .optional(),
  description: z.string().optional(),
  type: z.nativeEnum(ComponentTypeEnum),
  baseUrl: toolBaseUrlSchema,
  openApiSpec: z.string().optional(),
  parsedSchema: z.record(z.unknown()).optional(),
  authenticationType: z.nativeEnum(ToolAuthenticationTypeEnum).optional(),
  credentialName: z.string().optional(),
  isTenantWideAccess: z.boolean().default(false),
  isActive: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  isDisabled: z.boolean().optional(),
  accessLevel: z.nativeEnum(ResourceAccessTypeEnum),
  createdBy: z.string().optional(),
  createdOn: z.string().optional(),
  lastModifiedBy: z.string().optional(),
  lastModifiedOn: z.string().optional(),
});
