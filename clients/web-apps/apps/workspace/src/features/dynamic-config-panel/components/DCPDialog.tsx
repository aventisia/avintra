import { DialogContent, DialogDefaultHeader, DialogWrapper } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { DCPForm, useDynamicConfigPanelStore } from "..";

export const DCPDialog = ({ children }: React.PropsWithChildren) => {
  // Get state and actions from the DynamicConfigPanel store
  const { showDialog, setShowDialog } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <DialogWrapper open={showDialog} onOpenChangeFn={() => setShowDialog(!showDialog)}>
      {children}
      <DialogContent side={"right"} className={cn("!max-w-[32rem]")}>
        <DialogDefaultHeader heading="Create new credential" />
        <ScrollArea
          style={{
            height: `calc(100vh - 3.8rem )`,
          }}
          className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4"
        >
          <DCPForm />
        </ScrollArea>
      </DialogContent>
    </DialogWrapper>
  );
};
