import { useSelectedPlan } from "../../hooks/useSeletedPlan";
import { BackToPlans } from "./BackToPlans";
import ChargeSummary from "./ChargeSummary";
import CompanyDetails from "./CompanyDetials";
import SelectedPlan from "./SelectedPlan";

const Summary = () => {
  const { planData, planType } = useSelectedPlan();
  return (
    <div className="w-full px-12">
      <BackToPlans />
      <div className="flex gap-3 justify-between ">
        <div className="flex flex-col gap-3 w-3/5">
          <SelectedPlan plan={planData} planType={planType} />
          <CompanyDetails />
        </div>
        <div className=" w-2/5">
          <ChargeSummary plan={planData} planType={planType} />
        </div>
      </div>
    </div>
  );
};

export default Summary;
