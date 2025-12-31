import { Badge } from "@aventisia/ui/badge";
import { cn } from "@aventisia/ui/lib";

import { PlanUsageDto } from "@/features/tenant/dtos/current-plan-dto";
import { Progress } from "@/features/tenant/shared/Progress";

interface UsageDetailsProps {
  planUsage: PlanUsageDto[] | undefined;
  className?: string;
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
      <p className="flex items-center">
        {name}{" "}
        {name == "Spaces" && (
          <Badge
            variant={"outline"}
            className="ml-1 bg-slate-100 text-2xs font-normal"
          >
            Coming soon
          </Badge>
        )}
      </p>
      <p className="font-light">
        {name == "Published Agents or AI Models"
          ? used
          : `${used} of ${limit} ${unit ? unit : ""}`}
      </p>
    </div>
    {name !== "Published Agents or AI Models" && (
      <Progress value={(used / limit) * 100} className="!w-full bg-accent" />
    )}
  </div>
);

const UsageDetails = ({ planUsage, className }: UsageDetailsProps) => {
  // Default values in case `planUsage` is undefined or empty
  const defaultUsage = [
    { resourceName: "PublishedItems", used: 0, limit: 1, unit: "" },
    { resourceName: "Storage", used: 0, limit: 1, unit: "MB" },
    { resourceName: "Spaces", used: 0, limit: 1, unit: "" },
  ];

  // Use planUsage if available, otherwise fallback to defaultUsage
  const usageData = planUsage ?? defaultUsage;

  return (
    <div className={cn(className)}>
      <h3 className="font-medium">Usage:</h3>
      <div className="mt-2 space-y-4">
        {/* Dynamically render usage items */}
        {usageData.map((item, index) => {
          // Skip the "Spaces" resource if it's not needed
          // if (item.resourceName === "Spaces") return null;

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
