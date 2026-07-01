import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { useAgentConfigStore } from "../../stores/agent-config-store";
import { AgentConfigForm } from "./AgentConfigForm";

const AgentConfigDialog = () => {
  const { open, setOpen } = useAgentConfigStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
    })),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        setOpen(open);
      }}
    >
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader heading={`Agent Config`} />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <AgentConfigForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AgentConfigDialog;
