import { Check, ChevronDown, Trash2 } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { MenuContent, MenuItem, MenuSeparator } from "@/components/MenuParts";

import { USER_ACCESS_ROLES } from "../../constants/user-access-roles.constant";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { getShareRoleLabel } from "../../utils/resource-user-access.util";

type RoleMenuProps = {
  role: ResourceAccessTypeEnum;
  personName: string;
  onChange: (role: ResourceAccessTypeEnum) => void;
  onRemove: () => void;
};

/**
 * Compact role picker for one person on the share list, ending in a remove action.
 */
export const RoleMenu = ({ role, personName, onChange, onRemove }: RoleMenuProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        aria-label={`Role of ${personName}: ${getShareRoleLabel(role)}`}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-ink-2 outline-none transition hover:bg-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-focus data-[state=open]:bg-muted data-[state=open]:text-ink"
      >
        {getShareRoleLabel(role)}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
    </DropdownMenu.Trigger>
    <MenuContent align="end" className="w-max">
      {USER_ACCESS_ROLES.map((option) => (
        <MenuItem
          key={option.value}
          onSelect={() => onChange(option.value)}
          className="h-auto items-start gap-3 whitespace-normal py-2 [&>svg]:text-focus data-[highlighted]:[&>svg]:text-focus"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink">{option.label}</span>
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              {option.description}
            </span>
          </span>
          {option.value === role && <Check className="mt-0.5" />}
        </MenuItem>
      ))}
      <MenuSeparator />
      <MenuItem isDestructive onSelect={onRemove}>
        <Trash2 />
        Remove access
      </MenuItem>
    </MenuContent>
  </DropdownMenu.Root>
);
