import { useShallow } from "zustand/react/shallow";

import { useInputOutputsStore } from "../stores/inputs-outputs-store";
import { InputOutputCard } from "./InputOutputCard";

const AddInputsOutputsDialog = () => {
  const { showDialog, setShowDialog } = useInputOutputsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  if (!showDialog) return null;

  return <InputOutputCard onClose={() => setShowDialog(false)} />;
};

export default AddInputsOutputsDialog;
