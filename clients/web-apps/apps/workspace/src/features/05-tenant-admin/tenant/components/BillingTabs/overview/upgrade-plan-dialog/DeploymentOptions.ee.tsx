import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

import ChoosePlan from "./ChoosePlan.ee";
import ChoosePlanOptions from "./ChoosePlanOptions.ee";
import CreditTopUp from "./CreditTopUp.ee";

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
