import { maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { ComponentTypeEnum } from "../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../enums/tool-authentication-type-enum";
import { hasBalancedPathPlaceholders } from "../utils/manual-openapi.util";
import { isValidIconUrl } from "../utils/tool-icon.util";

export const toolNameSchema = z
  .string()
  .min(1, { message: reqError("Tool name") })
  .max(255, { message: maxLenError("Tool name", 255) });

export const toolBaseUrlSchema = z
  .string()
  .min(1, { message: reqError("Base URL") })
  .max(1000, { message: maxLenError("Base URL", 1000) })
  .url({ message: "Base URL must be a valid URL" });

export const manualToolOperationHeaderSchema = z.object({
  key: z
    .string()
    .min(1, { message: reqError("Header name") })
    .max(255, { message: maxLenError("Header name", 255) }),
  description: z
    .string()
    .max(1000, { message: maxLenError("Header description", 1000) })
    .optional(),
});

export const manualToolOperationParameterSchema = z.object({
  name: z
    .string()
    .min(1, { message: reqError("Parameter name") })
    .max(255, { message: maxLenError("Parameter name", 255) }),
  in: z.enum(["query", "header"]),
  description: z
    .string()
    .max(1000, { message: maxLenError("Parameter description", 1000) })
    .optional(),
});

export const manualToolOperationSchema = z.object({
  name: z
    .string()
    .min(1, { message: reqError("Operation name") })
    .max(255, { message: maxLenError("Operation name", 255) }),
  description: z
    .string()
    .max(4000, { message: maxLenError("Operation description", 4000) })
    .optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  endpoint: z
    .string()
    .min(1, { message: reqError("Endpoint") })
    .max(500, { message: maxLenError("Endpoint", 500) })
    .regex(/^\/?[\w\-./{}]+(?:\/[\w\-./{}]+)*$/, {
      message: "Endpoint must be a valid path template (e.g. /users/{id})",
    })
    .refine(hasBalancedPathPlaceholders, {
      message: "Endpoint must close every path placeholder (e.g. /users/{id})",
    }),
  headers: z.array(manualToolOperationHeaderSchema).optional(),
  parameters: z.array(manualToolOperationParameterSchema).optional(),
  jsonPayload: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value?.trim()) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "JSON payload must be valid JSON" },
    ),
});

export const toolZodSchema = z.object({
  id: z.string().optional(),
  name: toolNameSchema,
  description: z.string().optional(),
  iconUrl: z
    .string()
    .max(1000, { message: maxLenError("Icon URL", 1000) })
    .refine(isValidIconUrl, { message: "Icon URL must be a valid http(s) URL" })
    .optional()
    .or(z.literal("")),
  type: z.nativeEnum(ComponentTypeEnum),
  baseUrl: toolBaseUrlSchema,
  openApiSpec: z.string().optional(),
  parsedSchema: z.record(z.unknown()).optional(),
  manualOperations: z
    .array(manualToolOperationSchema)
    .optional()
    .refine(
      (operations) => {
        if (!operations?.length) return true;
        const routes = operations.map((operation) => {
          const endpoint = operation.endpoint.trim().toLowerCase();
          return `${operation.method.toUpperCase()} ${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
        });
        return new Set(routes).size === routes.length;
      },
      { message: "Each method must use a unique HTTP method and endpoint combination." },
    ),
  authenticationType: z.nativeEnum(ToolAuthenticationTypeEnum).optional(),
  credentialName: z.string().optional(),
  isTenantWideAccess: z.boolean().default(false),
  isResourceAccessRestricted: z.boolean().default(false),
  isActive: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  isDisabled: z.boolean().optional(),
  accessLevel: z.nativeEnum(ResourceAccessTypeEnum),
  createdBy: z.string().optional(),
  createdOn: z.string().optional(),
  lastModifiedBy: z.string().optional(),
  lastModifiedOn: z.string().optional(),
});
