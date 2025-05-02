import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDefaultHeader,
  DialogFooter,
  DialogTrigger,
} from "@aventisia/ui/dialog";
import React, { ReactNode } from "react";
import { useLabelDataStore } from "../stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { FilePieChartIcon } from "lucide-react";
import { Button } from "@aventisia/ui/buttons";
import { useNavigate } from "react-router-dom";

// Define the props interface
interface TrainingDialogProps {
  children: ReactNode;
  // Add any other props you need
}

const TrainingDialog: React.FC<TrainingDialogProps> = ({ children }) => {
  const { modelName } = useLabelDataStore(
    useShallow((state) => ({
      modelName: state.modelName,
    })),
  );
  // Get the navigate function
  const navigate = useNavigate();

  return (
    <Dialog>
      <DialogTrigger tabIndex={-1} className="outline-none">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs">
        <DialogDefaultHeader heading="Training in progress" />
        <div className="flex flex-col items-center gap-4 p-7">
          <FilePieChartIcon className="h-24 w-24 opacity-40" />
          <h2 className="">Task Processing...</h2>
          <p className="text-xs text-muted-foreground">{`Your ${modelName} model is now training, and this can take upto an hour to finish. Check it's status by going to models.`}</p>
        </div>
        <DialogFooter className="px-2 py-2">
          <div className="flex justify-end gap-3">
            <DialogClose>
              <Button size={"xs"} variant={"ghost"}>
                Cancel
              </Button>
            </DialogClose>
            <Button size={"xs"} onClick={() => navigate("/model-library")}>
              Go to Models
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingDialog;
