import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { MachineAgentDialogWrapper } from "./MachineAgentDialogWrapper";
import { MachineAssignAgent } from "./MachineAssignAgent";

export const MachineAssignAgentDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Return dialog
  return (
    <MachineAgentDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[40rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading="Assign Agent"
          description="Machine details and agents"
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <MachineAssignAgent />
        </ScrollArea>
      </DialogContent>
    </MachineAgentDialogWrapper>
  );
};
