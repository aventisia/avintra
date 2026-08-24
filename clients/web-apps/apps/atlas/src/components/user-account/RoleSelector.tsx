import { Checkbox } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@avplatform/ui/command";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { useBaseLayoutStore, useUserSessionStore } from "@avplatform/ui/stores";
import { CheckIcon, ChevronDownIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getRoleLabel } from "@/constants/roles";

interface RoleSelectorProps {
  /** Additional class name to override the nested popover content container style */
  className?: string;
}

/**
 * Role selector that lets the user pick which of their assigned roles are active
 * for filtering the sidebar menu. Rendered as a nested popover (Command + checkboxes)
 * inside the user account popover.
 *
 * - Defaults to all of the user's roles on first login.
 * - Persists the selection in localStorage across sessions.
 * - Prevents deselecting the last remaining role so the sidebar is never empty.
 */
const RoleSelector = ({ className }: RoleSelectorProps) => {
  const [open, setOpen] = useState(false);

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const { selectedRoles, setSelectedRoles } = useBaseLayoutStore(
    useShallow((state) => ({
      selectedRoles: state.selectedRoles,
      setSelectedRoles: state.setSelectedRoles,
    })),
  );

  // The roles actually assigned to the user (the only ones they may toggle).
  const assignedRoles = userSession?.userRoles ?? [];

  const handleToggle = (role: string) => {
    const isSelected = selectedRoles.includes(role);
    // Prevent deselecting the last remaining role.
    if (isSelected && selectedRoles.length === 1) return;

    const next = isSelected
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];

    setSelectedRoles(next);
    localStorage.setItem("atlas_selected_roles", next.join(","));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-full justify-start gap-2 rounded-sm align-middle font-normal"
        >
          <ShieldCheckIcon className="h-4 w-4" />
          <span className="flex-1 text-left">Roles</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="left" className={cn("w-64 p-0", className)}>
        <Command>
          <CommandInput placeholder="Search roles..." />
          <CommandList>
            <CommandEmpty>No roles found</CommandEmpty>
            <CommandGroup>
              {assignedRoles.map((role) => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <CommandItem
                    key={role}
                    value={role}
                    onSelect={() => handleToggle(role)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(role)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <span className="flex-1">{getRoleLabel(role)}</span>
                    {isSelected && <CheckIcon className="h-4 w-4 text-primary" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { RoleSelector };
