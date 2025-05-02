import { maxLenError, reqError } from "@aventisia/ui/utils";
import * as z from "zod";

import { AccessType, Features } from "./permissions-and-acesses";

export const rolePermissionSchema = z.object({
  feature: z.nativeEnum(Features),
  accesses: z.array(z.nativeEnum(AccessType)),
});

export const roleNameSchema = z
  .string()
  .min(1, { message: reqError("Role name") })
  .max(256, { message: maxLenError("Role name", 256) });

export const addRoleFormZodSchema = z.object({
  id: z.string().optional(),
  fullName: roleNameSchema,
  description: z
    .string()
    .min(0, { message: reqError("Role description") })
    .max(500, { message: maxLenError("Role description", 500) })
    .optional(),
  rolePermissions: z
    .array(rolePermissionSchema)
    .refine((permissions) => permissions.some((p) => p.accesses.length > 0), {
      message: "At least one access must be selected for any permission type",
    }),
});

export type RolePermission = z.infer<typeof rolePermissionSchema>;
