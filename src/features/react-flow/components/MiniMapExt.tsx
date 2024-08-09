import { MiniMap } from "@xyflow/react";

export const MiniMapExt = () => {
  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      <MiniMap ariaLabel={null} className="rounded-lg bg-white" zoomable pannable />
    </div>
  );
};
