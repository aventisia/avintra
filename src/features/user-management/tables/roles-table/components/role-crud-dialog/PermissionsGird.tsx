import { Info } from "lucide-react";
import React from "react";

import { CheckboxField } from "@/react-toolkit/ui/form/fields/CheckboxField";
import { Tooltip, TooltipProvider } from "@/react-toolkit/ui/Tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

import {
  ACCESSES,
  AccessType,
  Features,
  permissionTypes,
  roles,
} from "../../constants/permissions-and-acesses";
import { usePermissionsGird } from "../../hooks/usePermissionsGird";

// Define interface for the role permission data structure
interface RolePermission {
  permissionType: Features;
  accesses: AccessType[];
}

interface PermissionsGridProps {
  initialData?: RolePermission[];
  onPermissionsChange?: (permissions: RolePermission[]) => void;
}

const PermissionsGrid: React.FC<PermissionsGridProps> = ({
  initialData = [],
  onPermissionsChange,
}) => {
  const { permissions, togglePermission } = usePermissionsGird({
    initialData,
    onPermissionsChange,
  });

  return (
    <div className="text-md mx-auto w-full rounded-lg border bg-white">
      {/* Header row */}
      <div className="grid grid-cols-7 rounded-t-lg border-b">
        <div className="col-span-2 min-w-40 whitespace-nowrap border-r p-3 font-medium">
          Features
        </div>
        {ACCESSES.map((permission) => (
          <div
            key={permission + "1"}
            className="flex justify-center whitespace-nowrap p-3 font-medium"
          >
            {permission?.replace(/([A-Z])/g, " $1")}
          </div>
        ))}
      </div>

      {/* Role rows */}
      {roles.map((role) => (
        <div key={role.id} className="grid grid-cols-7">
          <div className="col-span-2 flex min-w-40 items-center gap-1 whitespace-nowrap border-r p-3 font-medium">
            {role.name?.replace(/([A-Z])/g, " $1")}
            <TooltipProvider delayDuration={100}>
              <Tooltip content={role.tooltip}>
                <TooltipTrigger asChild>
                  <Info size={14} />
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>

          {permissionTypes.map((permission) => (
            <div
              key={`${role.id}-${permission.id}`}
              className="flex items-center justify-center p-3"
            >
              <CheckboxField
                name={`${role.id}-${permission.id}`}
                label=""
                checked={!!permissions[`${role.id}-${permission.id}`]}
                onCheckedChange={() => togglePermission(role.id, permission.id)}
                className="mx-auto"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PermissionsGrid;
