import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { MetaLine } from "@avplatform/ui/meta-line";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { formatDate, needsDeferredProfile } from "@avplatform/ui/utils";
import { CrownSimpleIcon, InfoIcon, RocketLaunchIcon } from "@phosphor-icons/react";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { PlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import { useCancelPlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/cancel-plan-dialog-store.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";
import { getBillingPeriod } from "@/features/05-tenant-admin/tenant/utils/plan-display.util.ee";

import BillingFrequency from "./BillingFrequency.ee";

const ACCOUNTS_CHECKOUT_PATH = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding?plan=";

const STATUS_TONES = {
  ok: "bg-ok/10 text-ok ring-ok/25",
  warn: "bg-warn/10 text-warn ring-warn/25",
  bad: "bg-bad/10 text-bad ring-bad/25",
};

type PlanHeroProps = {
  plan: PlanDto;
  isStarterPlan: boolean;
  isPaymentProcessing: boolean;
};

/**
 * Banner for the tenant's current plan: name, status, billing, price, and the upgrade and
 * cancel actions.
 */
export const PlanHero = ({ plan, isStarterPlan, isPaymentProcessing }: PlanHeroProps) => {
  const openCancelDialog = useCancelPlanDialogStore((state) => state.setOpen);
  const openUpgradeDialog = useUpgradePlanDialogStore((state) => state.setOpen);
  const userSession = useUserSessionStore((state) => state.userSession);

  const openUpgrade = () => {
    if (isStarterPlan && needsDeferredProfile(userSession)) {
      window.location.href = ACCOUNTS_CHECKOUT_PATH;
      return;
    }
    openUpgradeDialog(true);
  };

  const status = isPaymentProcessing
    ? { label: "Updating", tone: "warn" as const }
    : plan.isActive
      ? { label: "Active", tone: "ok" as const }
      : { label: "Expired", tone: "bad" as const };

  return (
    <section className="relative isolate overflow-hidden rounded-lg bg-surface ring-1 ring-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary/[0.07] via-primary/[0.02] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-3/5 opacity-60 [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent)]"
      />
      <CrownSimpleIcon
        aria-hidden="true"
        weight="duotone"
        className="pointer-events-none absolute -bottom-10 right-56 -z-10 size-44 rotate-[-12deg] text-primary opacity-[0.06]"
      />

      {isPaymentProcessing && (
        <p className="flex items-center gap-2 border-b border-warn/20 bg-warn/10 px-5 py-2 text-[12.5px] font-medium text-warn">
          <InfoIcon className="size-4 shrink-0" />
          Your account will be updated shortly.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-8 gap-y-5 px-5 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-surface text-primary-text shadow-sm ring-1 ring-line">
            <CrownSimpleIcon className="size-7" weight="duotone" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-label uppercase text-muted-foreground">Current plan</p>
            <div className="flex items-center gap-2.5">
              <h2 className="truncate text-title text-ink">{plan.planName}</h2>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset",
                  STATUS_TONES[status.tone],
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {status.label}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {!isStarterPlan && <BillingFrequency currentPlan={plan} />}
              <MetaLine
                className="text-[12px] text-muted-foreground"
                items={[
                  plan.expiredOn &&
                    `${plan.isActive ? "Renews" : "Expired"} ${formatDate(plan.expiredOn)}`,
                  plan.isRecurringPayment && "Auto-pay on",
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-right">
            <span className="block font-mono text-[28px] font-medium leading-8 tracking-[-0.02em] tabular-nums text-ink">
              {formatCurrency(plan.price ?? 0, plan.currency ?? "USD")}
            </span>
            <span className="text-[12px] text-muted-foreground">
              per {getBillingPeriod(plan.frequency)}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => openCancelDialog(true)}>
              Cancel plan
            </Button>
            <Button
              className="gap-1.5"
              disabled={isPaymentProcessing}
              onClick={openUpgrade}
            >
              <RocketLaunchIcon className="size-4" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
