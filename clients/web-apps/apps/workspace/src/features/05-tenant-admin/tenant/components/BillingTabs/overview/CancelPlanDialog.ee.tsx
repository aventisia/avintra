import { IconTile } from "@avplatform/ui/icon-tile";
import { Label } from "@avplatform/ui/label";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { ProhibitIcon, WarningIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { useCancelPlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/cancel-plan-dialog-store.ee";

const ReasonOption = ({ id, value, label }: { id: string; value: string; label: string }) => (
  <div className="flex items-center gap-3">
    <RadioGroupItem value={value} id={id} />
    <Label htmlFor={id} className="text-[13px] font-normal text-ink-2">
      {label}
    </Label>
  </div>
);

const CancelPlanDialog = () => {
  const { isOpen, setOpen } = useCancelPlanDialogStore();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const planType = userSession?.planType ?? "";

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      widthClassName="w-[min(40rem,calc(100vw-2rem))]"
      mark={
        <IconTile
          Icon={ProhibitIcon}
          size="lg"
          className="size-12 rounded-lg text-bad [&>svg]:size-6"
        />
      }
      eyebrow="Cancel plan"
      eyebrowClassName="text-bad"
      title={planType ? `${planType} plan` : "Your plan"}
      footer={
        <>
          <p className="flex min-w-0 items-center gap-2 text-[12.5px] text-muted-foreground">
            <WarningIcon className="size-4 shrink-0 text-warn" />
            <span className="truncate">This can’t be undone</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton data-autofocus onClick={() => setOpen(false)}>
              Don’t cancel
            </CardDialogButton>
            <CardDialogButton variant="danger" onClick={() => setOpen(false)}>
              Cancel plan
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div className="flex items-center gap-2.5 rounded-md bg-bad/10 px-3.5 py-2.5 text-[13px] font-medium text-bad">
        <WarningIcon className="size-4 shrink-0" />
        This action will permanently delete your account
      </div>

      <div className="mt-4 text-[13px] leading-5 text-ink-2">
        <p className="mb-2">
          You are about to cancel your <span className="font-semibold text-ink">{planType}</span>{" "}
          plan. Before you continue, please note the following:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {planType === "Starter" && (
            <>
              <li>
                Cancelling your plan will{" "}
                <span className="font-semibold text-ink">
                  permanently delete your entire account immediately
                </span>
                . All Agents and associated data will be lost and cannot be recovered.
              </li>
              <li>Please export any data you wish to keep before proceeding.</li>
            </>
          )}

          {planType === "Pro" && (
            <>
              <li>Your plan will remain active until the end of your current billing cycle.</li>
              <li>
                Once cancelled, your entire account - including all Agents and associated data -
                will be{" "}
                <span className="font-semibold text-ink">
                  permanently deleted and cannot be recovered
                </span>
                .
              </li>
              <li>
                You can continue using all features and export your data until your plan expires
              </li>
            </>
          )}

          <li>
            <span className="font-semibold text-ink">
              Any unused top-up credits will also be forfeited
            </span>
            , even if their expiration date is in the future.
          </li>
          <li>
            This action <span className="font-semibold text-ink">cannot be undone</span>.
          </li>
        </ul>
      </div>

      <div className="mt-4 space-y-3 rounded-md bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
        <p className="text-[13px] font-semibold text-ink">
          Help us improve - why are you cancelling?
        </p>
        <RadioGroup className="gap-2">
          <ReasonOption
            id="r1"
            value="productQuality"
            label="I am not satisfied with the product quality"
          />
          <ReasonOption
            id="r2"
            value="customerSupport"
            label="I am not satisfied with the customer support/service"
          />
          {planType === "Starter" && (
            <ReasonOption
              id="r3"
              value="foundAlternativeSolution"
              label="I found an alternative solution"
            />
          )}
          {planType === "Pro" && (
            <ReasonOption
              id="r3"
              value="pricing"
              label="The pricing does not meet my expectations"
            />
          )}
          <ReasonOption id="r4" value="others" label="Other (please share your feedback)" />
        </RadioGroup>
      </div>
    </CardDialog>
  );
};

export default CancelPlanDialog;
