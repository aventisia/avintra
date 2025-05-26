import { iconMapper } from "@/components/icon-mapper";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PrimaryCategoryType } from "../types/primary-category-type";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { Badge } from "@aventisia/ui/badge";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useShallow } from "zustand/react/shallow";

interface PrimaryCategoryProps {
  data: PrimaryCategoryType;
}

export const PrimaryCategory = ({ data }: PrimaryCategoryProps) => {
  const { projectInfo } = useCurrentFlowStore(
    useShallow((state) => ({
      projectInfo: state.projectInfo,
    })),
  );

  return (
    <div className="flex w-full items-center gap-3 px-2 py-2">
      {/* Category icon or image */}
      {data.icon ? (
        <div>{iconMapper[data.icon]}</div>
      ) : (
        <FallbackImageIcon src={data.img} />
      )}

      <div className="grow space-y-0.5">
        {/* Category heading */}
        <div className="flex gap-2">
          <h2 className="flex items-center text-xs font-medium text-foreground">
            {data.label}
            {projectInfo.type === "AutomationAgent" &&
              data.name === "aiIntegrations" && (
                <Badge variant="outline" className="ml-1">
                  Coming Soon
                </Badge>
              )}
          </h2>
        </div>

        {/* Category description */}
        <p className="text-2xs text-muted-foreground">{data.description}</p>
      </div>
      <ArrowRightIcon className="h-3.5 max-h-3.5 min-h-3.5 w-3.5 min-w-3.5 max-w-4 stroke-2 text-slate-400" />
    </div>
  );
};
