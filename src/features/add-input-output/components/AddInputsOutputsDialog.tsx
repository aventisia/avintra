import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { useInputOutputsStore } from "../stores/inputs-outputs-store";
import { useShallow } from "zustand/react/shallow";
import AddInputsOutputsForm from "./AddInputsOutputsForm";

const AddInputsOutputsDialog = () => {
  const { showDialog, setShowDialog } = useInputOutputsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader heading="Add Input/Output" />
        <AddInputsOutputsForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddInputsOutputsDialog;
