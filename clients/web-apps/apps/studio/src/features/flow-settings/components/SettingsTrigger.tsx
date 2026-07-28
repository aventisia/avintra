import { Tooltip } from "@avplatform/ui/tooltip";
import { Settings } from "lucide-react";
import { Button } from "@avplatform/ui/buttons";
import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useShallow } from "zustand/react/shallow";
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
          className="hover:bg-white/10"
          onClick={() => openPanel(PANEL_ID, "right")}
        >
          <Settings className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </Button>
      </Tooltip>
    </>
  );
};
