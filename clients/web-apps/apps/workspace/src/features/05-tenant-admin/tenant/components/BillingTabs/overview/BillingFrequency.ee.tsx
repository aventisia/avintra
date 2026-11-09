import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowsClockwiseIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { PlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

const CHIP_CLASS =
  "inline-flex h-6 items-center gap-1.5 rounded-md bg-sunken px-2 text-[12px] font-medium text-ink-2 ring-1 ring-inset ring-line";

const BillingFrequency = ({ currentPlan }: { currentPlan: PlanDto | undefined }) => {
  const { setOpen, setChosenPlan, setPlanFrequency, setCurrency } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      setOpen: state.setOpen,
      setPlanFrequency: state.setPlanFrequency,
      setCurrency: state.setCurrency,
    })),
  );

  const label = (
    <>
      <ArrowsClockwiseIcon className="size-3.5 text-muted-foreground" />
      Billed {currentPlan?.frequency?.toLowerCase()}
    </>
  );

  if (import.meta.env.MODE === "production") {
    return <span className={CHIP_CLASS}>{label}</span>;
  }

  return (
    <Tooltip content="Change billing frequency">
      <button
        type="button"
        className={`${CHIP_CLASS} group outline-none transition hover:bg-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-focus`}
        onClick={() => {
          setChosenPlan("FrequencyChange");
          setPlanFrequency(currentPlan?.frequency == "Yearly" ? "monthly" : "yearly");
          setCurrency(currentPlan?.currency || "USD");
          setOpen(true);
        }}
      >
        {label}
        <PencilSimpleIcon className="size-3 text-muted-foreground group-hover:text-ink" />
      </button>
    </Tooltip>
  );
};

export default BillingFrequency;
