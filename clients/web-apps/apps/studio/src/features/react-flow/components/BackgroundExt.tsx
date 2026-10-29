import { Background, BackgroundVariant } from "@xyflow/react";
import { memo } from "react";

export const BackgroundExt = memo(() => {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={15}
      size={1}
      color="var(--canvas-grid)"
      className="!bg-bg"
    />
  );
});
