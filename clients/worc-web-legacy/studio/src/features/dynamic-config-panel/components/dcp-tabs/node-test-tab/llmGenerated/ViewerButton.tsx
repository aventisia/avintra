import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel/stores/dcp-store";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export default function ViewerButton() {
  // Get state and actions from the DynamicConfigPanel store
  const { showViewer, nodeData, setShowViewer } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showViewer: state.showViewer,
      nodeData: state.nodeData,
      setShowViewer: state.setShowViewer,
    })),
  );

  // Close viewer when moving away form test screen
  useEffect(() => {
    return () => {
      setShowViewer(false);
    };
  }, []);

  if (nodeData?.name !== "CreateInferencingAIAgent") return <></>;

  return (
    <Button
      type="button"
      size={"sm"}
      onClick={() => {
        setShowViewer(!showViewer);
      }}
    >
      <ArrowLeftIcon
        className={cn(
          "mr-2 h-4 w-4 text-primary-foreground transition-transform",
          showViewer && "rotate-180",
        )}
      />
      Viewer
    </Button>
  );
}
