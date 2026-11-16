import { IconTile } from "@avplatform/ui/icon-tile";
import { CalendarIcon, CoinsIcon, RocketLaunchIcon } from "@phosphor-icons/react";
import { useIsMutating } from "@tanstack/react-query";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { insertCreditTopUp } from "@/features/05-tenant-admin/tenant/apis/credit-top-up-apis.ee";
import { upgradePlan } from "@/features/05-tenant-admin/tenant/apis/tenant-subscription-apis.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

import DeploymentOptions from "./DeploymentOptions.ee";

const HEADERS = {
  Credits: { Icon: CoinsIcon, title: "Credits top-up" },
  FrequencyChange: { Icon: CalendarIcon, title: "Change billing frequency" },
  default: { Icon: RocketLaunchIcon, title: "Upgrade" },
};

const UpgradePlanDialog = () => {
  const { isOpen, chosenPlan, setOpen, resetToDefault } = useUpgradePlanDialogStore();
  const isInitiatingPayment =
    useIsMutating({
      predicate: ({ options }) =>
        options.mutationFn === upgradePlan || options.mutationFn === insertCreditTopUp,
    }) > 0;
  const { Icon, title } =
    chosenPlan === "Credits" || chosenPlan === "FrequencyChange"
      ? HEADERS[chosenPlan]
      : HEADERS.default;

  const handleClose = () => {
    setTimeout(() => {
      resetToDefault();
    }, 0);
    setOpen(false);
  };

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={handleClose}
      isDismissLocked={isInitiatingPayment}
      widthClassName="w-[min(60rem,calc(100vw-2rem))]"
      mark={<IconTile Icon={Icon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow="Billing"
      title={title}
      footer={
        <>
          {isInitiatingPayment ? (
            <StatusLine tone="pending">Initiating payment</StatusLine>
          ) : (
            chosenPlan && <StatusLine tone="idle">Payment opens in a secure checkout</StatusLine>
          )}
          <CardDialogButton
            className="ml-auto"
            onClick={handleClose}
            disabled={isInitiatingPayment}
          >
            Close
          </CardDialogButton>
        </>
      }
    >
      <DeploymentOptions />
    </CardDialog>
  );
};

export default UpgradePlanDialog;
