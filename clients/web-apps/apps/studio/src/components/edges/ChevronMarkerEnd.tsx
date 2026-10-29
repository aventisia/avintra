import { MARKER_ARROW_PREFIX } from "@/constants";

interface ChevronMarkerEndProps {
  edgeId: string;
  stroke?: string;
}

export const ChevronMarkerEnd = ({ stroke, edgeId }: ChevronMarkerEndProps) => {
  return (
    <svg>
      <defs>
        <marker
          id={`${MARKER_ARROW_PREFIX}${edgeId}`}
          markerWidth="12"
          markerHeight="12"
          refX="8"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M4 3 L7 6 L4 9"
            fill="none"
            style={{ stroke }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </svg>
  );
};
