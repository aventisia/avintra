import {
  Panel,
  PanelClose,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/components/panel/components/Panel";
import { SettingsForm } from "./SettingsForm";
import { PANEL_ID } from "../constants";

export const FlowSettings = () => {
  return (
    <Panel
      id={PANEL_ID}
      width="w-80"
      //  closeOnEscape={false}
    >
      <PanelHeader>
        <PanelTitle>Settings</PanelTitle>
        <PanelClose />
      </PanelHeader>
      <PanelContent>
        <SettingsForm />
      </PanelContent>
    </Panel>
  );
};
