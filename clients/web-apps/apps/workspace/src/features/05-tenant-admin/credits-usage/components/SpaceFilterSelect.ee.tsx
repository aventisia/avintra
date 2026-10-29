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
import { CheckIcon, ChevronDownIcon, LayoutGridIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFetchSpaceOptions } from "@/features/05-tenant-admin/spaces/hooks/useFetchSpaceOptions";

import { useSpaceFilterStore } from "../store/space-filter-store.ee";

/**
 * Space filter for the Usage page, styled like the Roles selector in the User
 * Account section (Popover trigger + Command list with checkbox items).
 *
 * - All spaces (including Central) are selected by default.
 * - Deselecting the last remaining space is prevented so the filter is never empty.
 * - The trigger shows the count of selected spaces, or "All spaces" when every
 *   available space is selected.
 */
export const SpaceFilterSelect = () => {
  const [open, setOpen] = useState(false);
  const { data } = useFetchSpaceOptions();

  const { allSpaceIds, selectedSpaceIds, setAllSpaceIds, setCentralSpaceId, setSelectedSpaceIds } =
    useSpaceFilterStore(
      useShallow((s) => ({
        allSpaceIds: s.allSpaceIds,
        selectedSpaceIds: s.selectedSpaceIds,
        setAllSpaceIds: s.setAllSpaceIds,
        setCentralSpaceId: s.setCentralSpaceId,
        setSelectedSpaceIds: s.setSelectedSpaceIds,
      })),
    );

  const spaceOptions = data?.data || [];

  // Initialise the store with the loaded space options (all selected by default).
  useEffect(() => {
    if (spaceOptions.length === 0) return;
    const ids = spaceOptions.map((o) => o.value);
    const central = spaceOptions.find((o) => o.isDefault)?.value ?? null;
    setAllSpaceIds(ids);
    setCentralSpaceId(central);
    setSelectedSpaceIds(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceOptions.length]);

  const allSelected =
    allSpaceIds.length > 0 &&
    allSpaceIds.length === selectedSpaceIds.length &&
    allSpaceIds.every((id) => selectedSpaceIds.includes(id));

  const handleToggle = (id: string) => {
    const isSelected = selectedSpaceIds.includes(id);
    // Prevent deselecting the last remaining space.
    if (isSelected && selectedSpaceIds.length === 1) return;
    setSelectedSpaceIds(
      isSelected ? selectedSpaceIds.filter((s) => s !== id) : [...selectedSpaceIds, id],
    );
  };

  const triggerLabel = allSelected
    ? "All spaces"
    : `${selectedSpaceIds.length} of ${allSpaceIds.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 rounded-sm align-middle font-normal">
          <LayoutGridIcon className="h-4 w-4" />
          <span>{triggerLabel}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search spaces..." />
          <CommandList>
            <CommandEmpty>No spaces found</CommandEmpty>
            <CommandGroup>
              {spaceOptions.map((option) => {
                const isSelected = selectedSpaceIds.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleToggle(option.value)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(option.value)}
                      className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
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
