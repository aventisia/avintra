import { cn } from "@avplatform/ui/lib";

import { PlanUsageDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto";
import { useFetchAgentsAndModelsCount } from "@/features/05-tenant-admin/tenant/hooks/useFetchAgentsAndModelsCount";

interface UsageDetailsProps {
  planUsage?: PlanUsageDto[];
  className?: string;
}

const DEFAULT_USAGE: PlanUsageDto[] = [
  { resourceName: "PublishedItems", used: 0, limit: 0, unit: "number" },
  { resourceName: "Spaces", used: 0, limit: 1, unit: "number" },
  { resourceName: "Storage", used: 0, limit: 1, unit: "MB" },
];

export const UsageDetails = ({ planUsage, className }: UsageDetailsProps) => {
  const usage = planUsage ?? DEFAULT_USAGE;
  const { agentsCount } = useFetchAgentsAndModelsCount();

  const storage = usage.find((u) => u.resourceName === "Storage");
  const spaces = usage.find((u) => u.resourceName === "Spaces");

  return (
    <div className={cn(className)}>
      <h3 className="font-medium">Usage:</h3>

      <div className="mt-4 space-y-6">
        {/* Published Agents */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <p>Published Agents</p>
            <p className="font-light">{agentsCount}</p>
          </div>
        </div>

        {/* Spaces */}
        {spaces && import.meta.env.MODE !== "production" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <p>Spaces</p>
              <p className="font-light">{spaces.used}</p>
            </div>
          </div>
        )}

        {/* Storage */}
        {storage && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <p>Storage</p>
              <p className="font-light">{`${storage.used} ${storage.unit}`}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
