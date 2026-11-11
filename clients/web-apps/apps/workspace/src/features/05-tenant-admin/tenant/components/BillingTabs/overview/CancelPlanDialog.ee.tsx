import { Separator } from "@avplatform/ui";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
} from "@avplatform/ui/dialog";
import { Label } from "@avplatform/ui/label";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { AlertTriangleIcon, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useCancelPlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/cancel-plan-dialog-store.ee";

const CancelPlanDialog = () => {
  const { isOpen, setOpen } = useCancelPlanDialogStore();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const planType = userSession?.planType ?? "";

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[45rem] px-1">
        <DialogHeader className="border-b px-6 py-4 pb-2">
          <DialogTitle className="justify-between">
            <h2 className="text-lg font-semibold">Cancel Plan</h2>
            <DialogPrimitive.Close className={buttonVariants({ variant: "ghost", size: "icon8" })}>
              <X className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Cancel Plan</span>
            </DialogPrimitive.Close>
          </DialogTitle>
        </DialogHeader>

        <div className="mx-5 mt-4 flex gap-3 rounded-lg bg-red-100 px-3 py-2 text-[0.85rem] text-red-800">
          <AlertTriangleIcon className="h-5 w-5 text-red-500" />
          Warning: This action will permanently delete your account
        </div>
        <div className="mt-2 space-y-4 px-6 pb-4 pt-1.5 text-md">
          <h2 className="-mb-1 text-lg font-medium">
            You are about to cancel your <span className="font-semibold">{planType}</span> Plan
          </h2>
          <div>
            <p className="mb-2">Before you continue, please note the following:</p>
            <ul className="list-disc pl-8">
              {/* Starter Plan: Points to note */}
              {planType === "Starter" && (
                <>
                  <li>
                    Cancelling your plan will{" "}
                    <span className="font-semibold">
                      permanently delete your entire account immediately
                    </span>
                    . All Agents and associated data will be lost and cannot be recovered.
                  </li>
                  <li>Please export any data you wish to keep before proceeding.</li>
                </>
              )}

              {/* Pro Plan: Points to note */}
              {planType === "Pro" && (
                <>
                  <li>Your plan will remain active until the end of your current billing cycle.</li>
                  <li>
                    Once cancelled, your entire account - including all Agents and associated data -
                    will be{" "}
                    <span className="font-semibold">
                      permanently deleted and cannot be recovered
                    </span>
                    .
                  </li>
                  <li>
                    You can continue using all features and export your data until your plan expires
                  </li>
                </>
              )}

              {/* Common point for all plans */}
              <li>
                <span className="font-semibold">
                  Any unused top-up credits will also be forfeited
                </span>
                , even if their expiration date is in the future.
              </li>
              <li>
                This action <span className="font-semibold">cannot be undone</span>.
              </li>
            </ul>
          </div>
          <Separator />

          <div className="space-y-2">
            <h3 className="text-base font-medium">Help us improve - why are you cancelling?</h3>

            <RadioGroup className="space-y-0.5 pl-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="productQuality" id="r1" />
                <Label htmlFor="r1" className="text-md font-normal">
                  I am not satisfied with the product quality
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="customerSupport" id="r2" />
                <Label htmlFor="r2" className="text-md font-normal">
                  I am not satisfied with the customer support/service
                </Label>
              </div>
              {/* Starter Plan: Additional reason */}
              {planType === "Starter" && (
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="foundAlternativeSolution" id="r3" />
                  <Label htmlFor="r3" className="text-md font-normal">
                    I found an alternative solution
                  </Label>
                </div>
              )}
              {/* Pro Plan: Additional reason */}
              {planType === "Pro" && (
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="pricing" id="r3" />
                  <Label htmlFor="r3" className="text-md font-normal">
                    The pricing does not meet my expectations
                  </Label>
                </div>
              )}
              <div className="flex items-center gap-3">
                <RadioGroupItem value="others" id="r4" />
                <Label htmlFor="r4" className="text-md font-normal">
                  Other (please share your feedback)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <Separator />
        <DialogFooter className="px-6 py-4 pb-4">
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
