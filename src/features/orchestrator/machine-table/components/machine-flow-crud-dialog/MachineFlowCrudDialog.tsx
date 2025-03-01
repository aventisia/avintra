import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { MachineFlowCrudForm } from "./MachineFlowCrudForm";
import { MachineFlowDialogWrapper } from "./MachineFlowDialogWrapper";

export const MachineFlowCrudDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Return dialog
  return (
    <MachineFlowDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading={`Assign Agent`}
          description={`Select Agent From the dropdown`}
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <MachineFlowCrudForm />
        </ScrollArea>
      </DialogContent>
    </MachineFlowDialogWrapper>
  );
};
