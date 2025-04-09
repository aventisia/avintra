import * as z from 'zod';

import { maxLenError, reqError } from '@/react-toolkit/utils/error-message-list';

import { AccessType, Features } from './permissions-and-acesses';

export const rolePermissionSchema = z.object({
  permissionType: z.nativeEnum(Features),
  accesses: z.array(z.nativeEnum(AccessType)),
});

export const roleNameSchema = z
  .string()
  .min(1, { message: reqError("Role Name") })
  .max(256, { message: maxLenError("Role Name", 256) });

export const addRoleFormZodSchema = z.object({
  id: z.string().optional(),
  name: roleNameSchema,
  description: z
    .string()
    .min(0, { message: reqError("Role Description") })
    .max(500, { message: maxLenError("Role Description", 500) })
    .optional(),
  rolePermissions: z
    .array(rolePermissionSchema)
    .refine((permissions) => permissions.some((p) => p.accesses.length > 0), {
      message: "At least one access must be selected for any permission type",
    }),
});

export type RolePermission = z.infer<typeof rolePermissionSchema>;
