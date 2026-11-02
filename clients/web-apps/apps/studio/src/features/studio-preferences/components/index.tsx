import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverDefaultHeader } from "@avplatform/ui/popover";
import { ScrollArea } from "@avplatform/ui/scroll";

import { POPOVER_HEADING } from "../constants";
import { useSetStudioPreferences } from "../hooks/useSetStudioPreferences";
import { StudioPreferencesForm } from "./StudioPreferencesForm";
import { StudioPreferencesTrigger } from "./StudioPreferencesTrigger";
import { StudioThemeSelect } from "./StudioThemeSelect";

interface StudioPreferencesProps {
  className?: string;
}

export const StudioPreferences = ({ className }: StudioPreferencesProps) => {
  // Set Studio preferences from local storage on load
  useSetStudioPreferences();

  return (
    <Popover>
      <StudioPreferencesTrigger />
      <PopoverContent align="end" variant={"responsive"} className={cn(className)}>
        <PopoverDefaultHeader heading={POPOVER_HEADING} />
        <ScrollArea className="grow px-1.5 py-3">
          <StudioThemeSelect />
          <StudioPreferencesForm />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
