import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import ChoosePlanOptions from "./ChoosePlanOptions";
import EnterprisePlan from "./EnterprisePlan";
import ProPlan from "./ProPlan";

const DeploymentOptions = () => {
  const { chosenPlan } = useUpgradePlanDialogStore();

  switch (chosenPlan) {
    case "":
      return <ChoosePlanOptions />;

    case "enterprise":
      return <EnterprisePlan />;

    case "pro":
      return <ProPlan />;

    default:
      return <ChoosePlanOptions />;
  }
};

export default DeploymentOptions;
