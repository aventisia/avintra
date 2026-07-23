import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store";

import ChoosePlan from "./ChoosePlan";
import ChoosePlanOptions from "./ChoosePlanOptions";
import CreditTopUp from "./CreditTopUp";

const DeploymentOptions = () => {
  const { chosenPlan } = useUpgradePlanDialogStore();

  switch (chosenPlan) {
    case "Pro":
      return <ChoosePlan />;
    case "FrequencyChange":
      return <ChoosePlan isFrequencyChange />;
    case "Credits":
      return <CreditTopUp />;
    default:
      return <ChoosePlanOptions />;
  }
};

export default DeploymentOptions;
