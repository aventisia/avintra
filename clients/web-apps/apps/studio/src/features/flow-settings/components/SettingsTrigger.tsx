import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { GearIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";

import { PANEL_ID } from "../constants";

export const SettingsTrigger = () => {
  const { openPanel } = usePanelStore(
    useShallow((state) => ({
      openPanel: state.openPanel,
    })),
  );

  return (
    <>
      <Tooltip content="Settings">
        <Button
          size="icon8"
          variant="ghost"
          className="hover:bg-hover hidden md:flex"
          onClick={() => openPanel(PANEL_ID, "right")}
        >
          <GearIcon className="h-[1.1rem] w-[1.1rem] text-ink-2" />
        </Button>
      </Tooltip>
    </>
  );
};
