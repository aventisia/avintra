import { DTCrudDialogWrapper } from "@/react-toolkit/ui/data-table/DTCrudDialogWrapper";
import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { MachineFlowCrudForm } from "./MachineFlowCrudForm";
import { useMachineFlowStore } from "../../store/machine-flow-store";

export const MachineFlowCrudDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Get dialog heading and description
  const { typeOfAssignment } = useMachineFlowStore();

  // Return dialog
  return (
    <DTCrudDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading={`Assign ${typeOfAssignment}`}
          description={`Select ${typeOfAssignment} From the dropdown`}
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <MachineFlowCrudForm />
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
