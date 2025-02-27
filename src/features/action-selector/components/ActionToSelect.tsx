import { iconMapper } from "@/components/icon-mapper";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { NodeDataType } from "@/types/node-data-type";
import { Badge } from "@/react-toolkit/ui/badge";

interface ActionToSelectProps {
  data: NodeDataType;
}

export const ActionToSelect = ({ data }: ActionToSelectProps) => {
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
            {data.label}{" "}
            {data.disabled && (
              <Badge className="ml-1 text-3xs">Coming soon</Badge>
            )}
          </h2>
        </div>

        {/* Category description */}
        <p className="text-2xs text-muted-foreground">{data.description}</p>
      </div>
    </div>
  );
};
