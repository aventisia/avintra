import { buttonVariants } from "@avplatform/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
} from "@avplatform/ui/dialog";
import { X } from "lucide-react";

import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

import DeploymentOptions from "./DeploymentOptions.ee";

const UpgradePlanDialog = () => {
  const { isOpen, chosenPlan, setOpen, resetToDefault } = useUpgradePlanDialogStore();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setTimeout(() => {
            resetToDefault();
          }, 0);
        }
        setOpen(open);
      }}
    >
      <DialogContent className="!max-w-[60rem] space-y-2 px-1">
        <DialogHeader className="border-b px-6 py-4 pb-2">
          <DialogTitle className="justify-between">
            <span className="text-heading">
              {chosenPlan == "Credits"
                ? "Credits Top-up"
                : chosenPlan == "FrequencyChange"
                  ? "Change Billing Frequency"
                  : "Upgrade"}
            </span>
            <DialogPrimitive.Close className={buttonVariants({ variant: "ghost", size: "icon8" })}>
              <X className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogTitle>
        </DialogHeader>

        <DeploymentOptions />
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePlanDialog;
