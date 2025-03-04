import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { MachineFlowDialogWrapper } from "./MachineFlowDialogWrapper";
import { MachineAssignAgent } from "./MachineAssignAgent";

export const MachineAssignAgentDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Return dialog
  return (
    <MachineFlowDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[40rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading="Assign Agent"
          description="Select Agent(s) From the list"
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <MachineAssignAgent />
        </ScrollArea>
      </DialogContent>
    </MachineFlowDialogWrapper>
  );
};
