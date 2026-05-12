import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";

import { Button } from "@aventisia/ui/buttons";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ViewerButton() {
  // Get state and actions from the DynamicConfigPanel store
  const { showViewer, setShowViewer } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showViewer: state.showViewer,
      setShowViewer: state.setShowViewer,
    })),
  );

  // Close viewer when moving away form test screen
  useEffect(() => {
    return () => {
      setShowViewer(false);
    };
  }, []);

  return (
    <Button
      type="button"
      size={"sm"}
      onClick={() => {
        setShowViewer(!showViewer);
      }}
    >
      <ArrowLeftIcon className="mr-2 h-4 w-4 text-primary-foreground" />
      Viewer
    </Button>
  );
}
