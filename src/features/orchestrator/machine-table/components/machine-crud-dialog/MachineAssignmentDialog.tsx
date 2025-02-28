import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { useShallow } from "zustand/react/shallow";
import { useMachineAssignmentStore } from "../../store/machine-assignment-store";
import { MachineAssignmentForm } from "./MachineAssignmentForm";
import { MachineAssignmentDialogWrapper } from "./MachineDialogWrapper";

export const MachineAssignmentDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Get update email store state
  const { assignmentHeading, isDialogOpen } = useMachineAssignmentStore(
    useShallow((state) => ({
      assignmentHeading: state.typeOfAssignment,
      isDialogOpen: state.isDialogOpen,
    })),
  );

  // Return dialog
  return (
    <MachineAssignmentDialogWrapper open={isDialogOpen}>
      {children}
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading={"Assign " + (assignmentHeading as string)}
          description={`Select the name of the ${assignmentHeading as string} from the dropdown`}
        />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <MachineAssignmentForm />
        </ScrollArea>
      </DialogContent>
    </MachineAssignmentDialogWrapper>
  );
};
