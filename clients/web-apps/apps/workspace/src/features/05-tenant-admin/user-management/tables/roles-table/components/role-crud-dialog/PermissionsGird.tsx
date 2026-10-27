import { Toggle } from "@avplatform/ui/toggle";
import { Tooltip, TooltipProvider } from "@avplatform/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import React from "react";

import { permissionTypes, roles } from "../../constants/permissions-and-acesses";
import { RolePermission } from "../../dtos/roles-table-dto";
import { usePermissionsGird } from "../../hooks/usePermissionsGird";

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
    <div className="mx-auto w-fit rounded-lg border bg-surface text-md">
      {/* Header row */}
      <div className="grid grid-cols-7 rounded-t-lg border-b">
        <div className="col-span-2 ms-1 whitespace-nowrap border-r px-2 py-1 font-medium">
          Features
        </div>
        {/* {ACCESSES.map((permission) => (
          <div
            key={permission + "1"}
            className="flex justify-center whitespace-nowrap font-medium"
          >
            {permission?.replace(/([A-Z])/g, " $1")}
          </div>
        ))} */}
      </div>

      {/* Role rows */}
      {roles.map((role) => (
        <div key={role.id} className="grid grid-cols-7">
          <div className="col-span-2 ms-1 flex items-center gap-2 whitespace-nowrap border-r px-2 py-1 font-medium">
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
            <div key={`${role.id}-${permission.id}`} className="flex items-center justify-center">
              {/* <CheckboxField
                name={`${role.id}-${permission.id}`}
                label=""
                checked={!!permissions[`${role.id}-${permission.id}`]}
                onCheckedChange={() => togglePermission(role.id, permission.id)}
                className="mx-auto"
              /> */}
              <Toggle
                pressed={!!permissions[`${role.id}-${permission.id}`]}
                onPressedChange={() => togglePermission(role.id, permission.id)}
                variant="outline"
                className="m-2 rounded-lg p-3 shadow-sm"
              >
                {permission.id}
              </Toggle>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PermissionsGrid;
