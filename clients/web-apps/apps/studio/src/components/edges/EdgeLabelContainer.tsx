import { EdgeLabelRenderer } from "@xyflow/react";

import { edgeLabelMapper } from "./EdgeLabelMapper";

interface EdgeLabelContainerProps {
  edgeId?: string;
  label: string | React.ReactNode;
  labelX?: number;
  labelY?: number;
}

export const EdgeLabelContainer = ({ edgeId, label, labelX, labelY }: EdgeLabelContainerProps) => {
  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(-60%, -42%) translate(${labelX}px, ${labelY}px)`, //translate x more considering marker-end in LR
          pointerEvents: "all",
        }}
      >
        {edgeLabelMapper(label as string, edgeId)}
      </div>
    </EdgeLabelRenderer>
  );
};
