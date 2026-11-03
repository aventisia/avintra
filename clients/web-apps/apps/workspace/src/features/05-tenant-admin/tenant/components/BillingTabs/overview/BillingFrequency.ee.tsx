import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { PlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

const BillingFrequency = ({ currentPlan }: { currentPlan: PlanDto | undefined }) => {
  const { setOpen, setChosenPlan, setPlanFrequency, setCurrency } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      setOpen: state.setOpen,
      setPlanFrequency: state.setPlanFrequency,
      setCurrency: state.setCurrency,
    })),
  );

  return (
    <>
      {import.meta.env.MODE !== "production" ? (
        <Tooltip content="Change billing frequency">
          <Button
            size={"xs"}
            className="border-muted bg-muted text-muted-foreground"
            onClick={() => {
              setChosenPlan("FrequencyChange");
              setPlanFrequency(currentPlan?.frequency == "Yearly" ? "monthly" : "yearly");
              setCurrency(currentPlan?.currency || "USD");
              setOpen(true);
            }}
          >
            Billed {currentPlan?.frequency}
            <PencilSimpleIcon className="ml-2 h-3 w-3" />
          </Button>
        </Tooltip>
      ) : (
        <Button size={"xs"} className="cursor-default border-muted bg-muted text-muted-foreground">
          Billed {currentPlan?.frequency}
        </Button>
      )}
    </>
  );
};

export default BillingFrequency;
