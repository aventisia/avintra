import { EdgeLabelRenderer } from "@xyflow/react";
import { edgeLabelMapper } from "./EdgeLabelMapper";

interface EdgeLabelContainerProps {
  label: string | React.ReactNode;
  labelX?: number;
  labelY?: number;
}

export const EdgeLabelContainer = ({
  label,
  labelX,
  labelY,
}: EdgeLabelContainerProps) => {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          pointerEvents: "all",
        }}
      >
        {edgeLabelMapper[label as string]}
      </div>
    </EdgeLabelRenderer>
  );
};
