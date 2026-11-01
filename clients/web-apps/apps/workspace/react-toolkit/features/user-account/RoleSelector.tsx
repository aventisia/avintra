import { Checkbox } from "@avplatform/ui";
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
import { ChevronRightIcon, ShieldCheckIcon } from "lucide-react";
import { type PointerEvent, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { SELECTED_ROLES_STORAGE_KEY } from "@/components/layout/AppLayout";
import { getRoleLabel } from "@/constants/roles";

import { AccountMenuAction } from "./AccountMenuAction";

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
  const closeTimer = useRef<number>();

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const openOnHover = (event: PointerEvent) => event.pointerType === "mouse" && openNow();
  const closeOnLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  };

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

    const next = isSelected ? selectedRoles.filter((r) => r !== role) : [...selectedRoles, role];

    setSelectedRoles(next);
    localStorage.setItem(SELECTED_ROLES_STORAGE_KEY, next.join(","));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <AccountMenuAction
          className="w-full"
          onPointerEnter={openOnHover}
          onPointerLeave={closeOnLeave}
          onClick={(event) => {
            event.preventDefault();
            openNow();
          }}
        >
          <ShieldCheckIcon />
          <span className="flex-1 text-left">Roles</span>
          <span className="font-mono text-2xs text-muted-foreground">
            {selectedRoles.length}/{assignedRoles.length}
          </span>
          <ChevronRightIcon />
        </AccountMenuAction>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        onPointerEnter={openOnHover}
        onPointerLeave={closeOnLeave}
        className={cn("w-64 p-0", className)}
      >
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
