interface ChevronMarkerEndProps {
  edgeId: string;
}

export const ChevronMarkerEnd = ({ edgeId }: ChevronMarkerEndProps) => {
  return (
    <svg>
      <defs>
        <marker
          id={`markerArrow_${edgeId}`}
          markerWidth="20"
          markerHeight="20"
          refX="13"
          refY="14"
          orient="auto"
        >
          <path
            d="m9 18 4-4-4-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </svg>
  );
};
