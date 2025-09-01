import { Separator } from "@aventisia/ui";
import { Button, buttonVariants } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { Label } from "@aventisia/ui/label";
import { RadioGroup, RadioGroupItem } from "@aventisia/ui/radio-group";
import { X } from "lucide-react";

import { useCancelPlanDialogStore } from "@/features/tenant/store/overview/cancel-plan-dialog-store";

const CancelPlanDialog = () => {
  const { isOpen, setOpen } = useCancelPlanDialogStore();

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[45rem] space-y-2 px-1">
        <DialogHeader className="border-b px-6 py-4 pb-2">
          <DialogTitle className="justify-between">
            <h2 className="text-lg font-semibold">Cancel Plan</h2>
            <DialogPrimitive.Close
              className={buttonVariants({ variant: "ghost", size: "icon8" })}
            >
              <X className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Cancel Plan</span>
            </DialogPrimitive.Close>
          </DialogTitle>
        </DialogHeader>

        <div className="text-md space-y-4 px-6 pb-4 pt-1.5">
          <h2 className="text-lg font-semibold">
            You're about to cancel your plan
          </h2>
          <div>
            <p>Please note the following before proceeding:</p>
            <ul className="list-disc pl-8">
              <li>
                Your membership will remain active until the end of your current
                billing cycle.
              </li>
              <li>
                Once cancelled, all published Agents and AI Models, along with
                their associated data, will be permanently deleted.
              </li>
              <li>
                You can continue to use all features and export your data until
                your plan expires.
              </li>
            </ul>
          </div>
          <Separator />

          <div className="space-y-2">
            <h3 className="text-base font-semibold">
              Help us improve — why are you cancelling?
            </h3>

            <RadioGroup className="space-y-1 pl-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="satisfied" id="r1" />
                <Label htmlFor="r1" className="text-md">
                  I’m not satisfied with the product quality
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="not-satisfied" id="r2" />
                <Label htmlFor="r2" className="text-md">
                  I’m not satisfied with the customer support/service
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="pricing" id="r3" />
                <Label htmlFor="r3" className="text-md">
                  The pricing does not meet my expectations
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="others" id="r4" />
                <Label htmlFor="r4" className="text-md">
                  Other (please share your feedback)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator />
        <DialogFooter className="px-4 py-2 pb-4">
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Don't Cancel
          </Button>
          <Button variant={"destructive"} onClick={() => setOpen(false)}>
            Cancel Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelPlanDialog;
