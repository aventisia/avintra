import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import ChoosePlan from "./ChoosePlan";
import ChoosePlanOptions from "./ChoosePlanOptions";
import CreditTopUp from "./CreditTopUp";

const DeploymentOptions = () => {
  const { chosenPlan } = useUpgradePlanDialogStore();

  switch (chosenPlan) {
    case "Pro":
      return <ChoosePlan />;
    case "Credits":
      return <CreditTopUp />;
    default:
      return <ChoosePlanOptions />;
  }
};

export default DeploymentOptions;
