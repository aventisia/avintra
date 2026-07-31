import { z } from "zod";

import { maxLenError, reqError } from "@avplatform/ui/utils";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";
import { ComponentTypeEnum } from "../enums/component-type-enum";

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
  description: z.string().optional(),
  type: z.nativeEnum(ComponentTypeEnum),
  baseUrl: toolBaseUrlSchema,
  openApiSpec: z.string().optional(),
  parsedSchema: z.record(z.unknown()).optional(),
  authenticationType: z.nativeEnum(ToolAuthenticationTypeEnum).optional(),
  credentialId: z.string().optional(),
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
