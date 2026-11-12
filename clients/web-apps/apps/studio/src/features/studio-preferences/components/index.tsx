import { cn } from "@avplatform/ui/lib";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDefaultHeader,
} from "@avplatform/ui/popover";
import { ScrollArea } from "@avplatform/ui/scroll";

import { POPOVER_HEADING } from "../constants";
import { useSetStudioPreferences } from "../hooks/useSetStudioPreferences";
import { StudioPreferencesForm } from "./StudioPreferencesForm";

interface StudioPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/** Preferences popover anchored to its children; opened from the header menu. */
export const StudioPreferences = ({
  open,
  onOpenChange,
  className,
  children,
}: React.PropsWithChildren<StudioPreferencesProps>) => {
  // Set Studio preferences from local storage on load
  useSetStudioPreferences();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent align="end" variant={"responsive"} className={cn(className)}>
        <PopoverDefaultHeader heading={POPOVER_HEADING} />
        <ScrollArea className="grow px-1.5 py-3">
          <StudioPreferencesForm />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
