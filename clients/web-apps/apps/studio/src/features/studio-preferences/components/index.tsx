import { ScrollArea } from "@avplatform/ui/scroll";

import {
  Panel,
  PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";

import { PANEL_ID, PANEL_TITLE } from "../constants";
import { useSetStudioPreferences } from "../hooks/useSetStudioPreferences";
import { StudioPreferencesForm } from "./StudioPreferencesForm";

/** Studio preferences panel, opened from the header menu. */
export const StudioPreferences = () => {
  // Set Studio preferences from local storage on load
  useSetStudioPreferences();

  return (
    <Panel
      id={PANEL_ID}
      side="right"
      width="w-[25rem]"
      className="top-[var(--header-height)] h-[calc(100vh-var(--header-height))] rounded-none duration-200 animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
    >
      <PanelHeader>
        <PanelTitle className="text-[1rem] font-semibold">{PANEL_TITLE}</PanelTitle>
        <PanelClose />
      </PanelHeader>
      <PanelContent>
        <ScrollArea className="h-[calc(100vh-var(--header-height)-3rem)]">
          <div className="px-4 py-3">
            <StudioPreferencesForm />
          </div>
        </ScrollArea>
      </PanelContent>
    </Panel>
  );
};
