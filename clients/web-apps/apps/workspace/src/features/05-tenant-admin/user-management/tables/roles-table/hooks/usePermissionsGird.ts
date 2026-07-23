import { useEffect, useState } from "react";

import {
  ACCESSES,
  AccessType,
  Features,
  permissionTypes,
  roles,
} from "../constants/permissions-and-acesses";
import { RolePermission } from "../constants/role-zod-schema";

export const usePermissionsGird = ({
  initialData,
  onPermissionsChange,
}: {
  initialData?: RolePermission[];
  onPermissionsChange?: (permissions: RolePermission[]) => void;
}) => {
  // Initialize permissions state
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Process incoming initialData to set checkbox states
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const permissionState: Record<string, boolean> = {};

      initialData.forEach((rolePermission) => {
        const { feature: permissionType, accesses } = rolePermission;

        // Check if all accesses except FULL_ACCESS are included
        const allAccessesExceptFull = ACCESSES.filter((access) => access !== AccessType.FullAccess);
        const hasAllAccesses = allAccessesExceptFull.every((access) =>
          accesses.includes(access as AccessType),
        );

        // If all accesses are included, mark FULL_ACCESS as checked
        if (hasAllAccesses) {
          permissionState[`${permissionType}-${AccessType.FullAccess}`] = true;
        }

        // For each access type that's enabled for this permission type
        accesses.forEach((access) => {
          permissionState[`${permissionType}-${access}`] = true;
        });
      });

      setPermissions(permissionState);
    }
  }, [initialData]);

  // Toggle a permission and update data
  const togglePermission = (role: Features, permission: AccessType) => {
    const updatedPermissions = { ...permissions };

    // Special handling for FULL_ACCESS
    if (permission === AccessType.FullAccess) {
      const newState = !permissions[`${role}-${permission}`];
      updatedPermissions[`${role}-${permission}`] = newState;

      // If FULL_ACCESS is checked, check all other permissions for this role
      // If FULL_ACCESS is unchecked, uncheck all other permissions for this role
      permissionTypes.forEach((pt) => {
        if (pt.id !== AccessType.FullAccess) {
          updatedPermissions[`${role}-${pt.id}`] = newState;
        }
      });
    } else {
      // Toggle the specific permission
      updatedPermissions[`${role}-${permission}`] = !permissions[`${role}-${permission}`];

      // Check if all permissions are now checked/unchecked to update FULL_ACCESS
      const allOtherPermissionsChecked = permissionTypes
        .filter((pt) => pt.id !== AccessType.FullAccess)
        .every((pt) => updatedPermissions[`${role}-${pt.id}`]);

      updatedPermissions[`${role}-${AccessType.FullAccess}`] = allOtherPermissionsChecked;
    }

    setPermissions(updatedPermissions);

    // Transform the data back to the format expected by the API
    if (onPermissionsChange) {
      const formattedData = transformPermissionsToRoleFormat(updatedPermissions);
      onPermissionsChange(formattedData);
    }
  };

  // Transform checkbox state to rolePermissions format
  const transformPermissionsToRoleFormat = (
    permissionsState: Record<string, boolean>,
  ): RolePermission[] => {
    const rolePermissions: RolePermission[] = [];

    // Group by role
    roles.forEach((role) => {
      const accesses: AccessType[] = [];

      // Check which permission types are enabled for this role
      permissionTypes.forEach((permission) => {
        // Skip FULL_ACCESS in the actual data since it's just a UI concept
        if (
          permission.id !== AccessType.FullAccess &&
          permissionsState[`${role.id}-${permission.id}`]
        ) {
          accesses.push(permission.id);
        }
      });

      // Only add to the result if there are permissions
      if (accesses.length > 0) {
        rolePermissions.push({
          feature: role.id,
          accesses,
        });
      }
    });

    return rolePermissions;
  };

  return { permissions, togglePermission };
};
