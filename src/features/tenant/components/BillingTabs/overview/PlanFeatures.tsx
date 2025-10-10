import { Check } from "lucide-react";

import { PlanFeatureDto } from "@/features/tenant/dtos/current-plan-dto";

interface PlanFeatureProps {
  label: string;
  value: string | number | undefined;
}

const PlanFeature = ({ label, value }: PlanFeatureProps) => (
  <li className="flex items-center gap-2">
    <CheckMark /> {`${value ?? "--"} ${label}`}
  </li>
);

interface PlanFeaturesProps {
  features: PlanFeatureDto | undefined;
}

const PlanFeatures = ({ features }: PlanFeaturesProps) => {
  return (
    <div className="border-r">
      <h3 className="font-medium">Plan Includes:</h3>
      <ul className="mt-2 space-y-2 text-sm">
        <PlanFeature
          label="credits/month"
          value={`${features?.maxCredits?.toLocaleString("en-US")}`}
        />
        <PlanFeature
          label="published agents or AI models"
          value={`${Number(features?.maxPublishedItems) <= 0 ? "Unlimited" : features?.maxPublishedItems}`}
        />
        <PlanFeature
          label="history retention"
          value={`${features?.historyRetentionDays} days`}
        />
        <PlanFeature label="spaces" value={`${features?.maxSpaces}`} />
        <PlanFeature label="storage" value={`${features?.storageLimitMB} MB`} />
        <PlanFeature
          label="Users"
          value={`${Number(features?.maxUsers) <= 0 ? "Unlimited" : features?.maxUsers}`}
        />
      </ul>
    </div>
  );
};

export default PlanFeatures;

export const CheckMark = () => {
  return (
    <div className="rounded-full bg-green-500 p-[2px]">
      <Check className="h-3 w-3 text-white" />
    </div>
  );
};
