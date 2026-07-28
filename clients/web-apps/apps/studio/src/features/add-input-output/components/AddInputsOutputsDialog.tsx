import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@avplatform/ui/dialog";
import { useInputOutputsStore } from "../stores/inputs-outputs-store";
import { useShallow } from "zustand/react/shallow";
import AddInputsOutputsForm from "./AddInputsOutputsForm";
import { ScrollArea } from "@avplatform/ui/scroll";

const AddInputsOutputsDialog = () => {
  const { showDialog, setShowDialog } = useInputOutputsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent side={"right"} className="!max-w-[40rem]">
        <DialogDefaultHeader heading="Add Input/Output" />
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <AddInputsOutputsForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddInputsOutputsDialog;
