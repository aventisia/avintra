import { Button } from "@avplatform/ui/buttons";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";

export const OpenNodeConfig = () => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    // Do not use DialogTrigger to open the dialog. It creats focus issue due to multiple DialogTriggers
    <Button
      onClick={() => {
        setShowDialog(!showDialog);
      }}
    >
      Add
    </Button>
  );
};
