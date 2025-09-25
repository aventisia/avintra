import { PlanUsageDto } from "@/features/tenant/dtos/current-plan-dto";
import { Progress } from "@/features/tenant/shared/Progress";

interface UsageDetailsProps {
  planUsage: PlanUsageDto[] | undefined;
}

interface UsageItemProps {
  name: string;
  used: number;
  limit: number;
  unit?: string;
}

const UsageItem = ({ name, used, limit, unit }: UsageItemProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm">
      <p>{name}</p>
      <p className="font-light">
        {used} of {limit} {unit && unit}
      </p>
    </div>
    <Progress value={(used / limit) * 100} className="!w-full bg-accent" />
  </div>
);

const UsageDetails = ({ planUsage }: UsageDetailsProps) => {
  // Default values in case `planUsage` is undefined or empty
  const defaultUsage = [
    { resourceName: "PublishedItems", used: 0, limit: 50, unit: "" },
    { resourceName: "Storage", used: 0, limit: 500, unit: "MB" },
  ];

  // Use planUsage if available, otherwise fallback to defaultUsage
  const usageData = planUsage ?? defaultUsage;

  return (
    <div>
      <h3 className="font-medium">Usage:</h3>
      <div className="mt-2 space-y-4">
        {/* Dynamically render usage items */}
        {usageData.map((item, index) => {
          // Skip the "Spaces" resource if it's not needed
          if (item.resourceName === "Spaces") return null;

          return (
            <UsageItem
              key={index}
              name={
                item.resourceName === "PublishedItems"
                  ? "Published Agents or AI Models"
                  : item.resourceName
              }
              used={item.used}
              limit={item.limit}
              unit={item.resourceName === "Storage" ? item.unit : undefined}
            />
          );
        })}
      </div>
    </div>
  );
};

export default UsageDetails;
