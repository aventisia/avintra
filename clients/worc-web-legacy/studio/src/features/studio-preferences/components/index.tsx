import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@aventisia/ui/popover";
import { ScrollArea } from "@aventisia/ui/scroll";
import { POPOVER_HEADING } from "../constants";
import { StudioPreferencesForm } from "./StudioPreferencesForm";
import { StudioPreferencesTrigger } from "./StudioPreferencesTrigger";
import { useSetStudioPreferences } from "../hooks/useSetStudioPreferences";
import { cn } from "@aventisia/ui/lib";
interface StudioPreferencesProps {
  className?: string;
}

export const StudioPreferences = ({ className }: StudioPreferencesProps) => {
  // Set Studio preferences from local storage on load
  useSetStudioPreferences();

  return (
    <Popover>
      <StudioPreferencesTrigger />
      <PopoverContent
        align="end"
        variant={"responsive"}
        className={cn(className)}
      >
        <PopoverDefaultHeader heading={POPOVER_HEADING} />
        <ScrollArea className="grow px-1.5 py-3">
          <StudioPreferencesForm />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
