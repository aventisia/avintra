import { buttonVariants } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { X } from "lucide-react";

import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import DeploymentOptions from "./DeploymentOptions";

const UpgradePlanDialog = () => {
  const { isOpen, setOpen, setChosenPlan } = useUpgradePlanDialogStore();

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[60rem] space-y-2 px-1">
        <DialogHeader className="border-b px-6 py-4 pb-2">
          <DialogTitle className="justify-between">
            <h2 className="text-lg font-semibold">Upgrade</h2>
            <DialogPrimitive.Close
              className={buttonVariants({ variant: "ghost", size: "icon8" })}
              onClick={() => {
                setTimeout(() => {
                  setChosenPlan("");
                }, 0);
              }}
            >
              <X className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Upgrade</span>
            </DialogPrimitive.Close>
          </DialogTitle>
        </DialogHeader>

        <DeploymentOptions />
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePlanDialog;
