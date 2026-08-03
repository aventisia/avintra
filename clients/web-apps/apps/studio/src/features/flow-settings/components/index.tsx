import {
  Panel,
  PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";

import { PANEL_ID } from "../constants";
import { SettingsForm } from "./SettingsForm";

export const FlowSettings = () => {
  return (
    <Panel
      id={PANEL_ID}
      width="w-96"
      //  closeOnEscape={false}
    >
      <PanelHeader>
        <PanelTitle>Settings</PanelTitle>
        <PanelClose />
      </PanelHeader>
      <PanelContent className="p-2.5">
        <SettingsForm />
      </PanelContent>
    </Panel>
  );
};
