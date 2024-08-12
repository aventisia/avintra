import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { POPOVER_HEADING } from "../constants";
import { StudioPreferencesForm } from "./StudioPreferencesForm";
import { StudioPreferencesTrigger } from "./StudioPreferencesTrigger";
import { useSetStudioPreferences } from "../hooks/useSetStudioPreferences";

export const StudioPreferences = () => {
  // Set Studio preferences from local storage on load
  useSetStudioPreferences();

  return (
    <Popover>
      <StudioPreferencesTrigger />
      <PopoverContent
        align="end"
        variant={"responsive"}
        className="mt-0 mlg:mt-4"
      >
        <PopoverDefaultHeader heading={POPOVER_HEADING} />
        <ScrollArea className="grow px-1.5 py-3">
          <StudioPreferencesForm />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
