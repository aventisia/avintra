import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import ChoosePlan from "./ChoosePlan";
import ChoosePlanOptions from "./ChoosePlanOptions";

const DeploymentOptions = () => {
  const { chosenPlan } = useUpgradePlanDialogStore();

  switch (chosenPlan) {
    case "Enterprise":
    case "Pro":
      return <ChoosePlan />;

    default:
      return <ChoosePlanOptions />;
  }
};

export default DeploymentOptions;
