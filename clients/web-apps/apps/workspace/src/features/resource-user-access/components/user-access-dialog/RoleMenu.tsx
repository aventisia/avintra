import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { MenuContent, MenuItem } from "@/components/MenuParts";

import { USER_ACCESS_ROLES } from "../../constants/user-access-roles.constant";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { getShareRoleLabel } from "../../utils/resource-user-access.util";

type RoleMenuProps = {
  role: ResourceAccessTypeEnum;
  personName: string;
  onChange: (role: ResourceAccessTypeEnum) => void;
};

/**
 * Compact role picker for one person on the share list.
 */
export const RoleMenu = ({ role, personName, onChange }: RoleMenuProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        aria-label={`Role of ${personName}: ${getShareRoleLabel(role)}`}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg px-2 text-[12.5px] font-medium text-slate-600 outline-none transition hover:bg-muted hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/50 data-[state=open]:bg-muted data-[state=open]:text-slate-900"
      >
        {getShareRoleLabel(role)}
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>
    </DropdownMenu.Trigger>
    <MenuContent align="end" className="w-56">
      {USER_ACCESS_ROLES.map((option) => (
        <MenuItem
          key={option.value}
          onSelect={() => onChange(option.value)}
          className="items-start whitespace-normal"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-slate-800">{option.label}</span>
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              {option.description}
            </span>
          </span>
          {option.value === role && <Check className="mt-0.5" />}
        </MenuItem>
      ))}
    </MenuContent>
  </DropdownMenu.Root>
);
