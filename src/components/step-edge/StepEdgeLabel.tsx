import { Badge } from "@/react-toolkit/ui/badge/badge";
import { EdgeLabelRenderer } from "@xyflow/react";

interface StepEdgeLabelProps {
  label?: string | React.ReactNode;
  labelX?: number;
  labelY?: number;
}

export const StepEdgeLabel = ({
  label,
  labelX,
  labelY,
}: StepEdgeLabelProps) => {
  return (
    <EdgeLabelRenderer>
      <Badge
        style={{
          position: "absolute",
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          pointerEvents: "all",
        }}
        className="nodrag nopan"
      >
        {label}
      </Badge>
    </EdgeLabelRenderer>
  );
};
