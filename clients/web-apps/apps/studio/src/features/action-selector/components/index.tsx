import { StopPropagationWrapper } from "@avplatform/ui";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { Panel } from "@/components/panel/components/Panel";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { AGENT_DETAILS_PANEL_ID } from "@/features/flow-versions/constants";

import { ACTION_SELECTOR_PANEL_ID } from "../constants/action-selector-panel.constant";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { ActionSelectorContent } from "./ActionSelectorContent";

/**
 * Renders the Node Selector (to add nodes to flow) as a left dock panel that stays open until closed.
 */
export const NodeSelector = () => {
  const { showDialog, setShowDialog } = useNodeSelectorStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );
  const { openPanel, closePanel } = usePanelStore(
    useShallow((state) => ({
      openPanel: state.openPanel,
      closePanel: state.closePanel,
    })),
  );

  // Agent details share the left dock, so opening the selector closes them.
  useEffect(() => {
    if (showDialog) {
      closePanel(AGENT_DETAILS_PANEL_ID);
      openPanel(ACTION_SELECTOR_PANEL_ID, "left");
    } else {
      closePanel(ACTION_SELECTOR_PANEL_ID);
    }
  }, [showDialog, openPanel, closePanel]);

  useHotkeys("esc", () => setShowDialog(false), { enabled: showDialog, preventDefault: true }, [
    showDialog,
    setShowDialog,
  ]);

  return (
    <StopPropagationWrapper className="flex">
      <Panel
        id={ACTION_SELECTOR_PANEL_ID}
        side="left"
        flush
        width="w-[34.25rem]"
        closeOnEscape={false}
        className="rounded-none border-y-0 border-l-0 shadow-none"
      >
        <ActionSelectorContent />
      </Panel>
    </StopPropagationWrapper>
  );
};
