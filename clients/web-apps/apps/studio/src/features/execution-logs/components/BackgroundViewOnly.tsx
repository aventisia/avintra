import { Background, BackgroundVariant } from "@xyflow/react";
import { memo } from "react";

export const BackgroundViewOnly = memo(() => {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={16}
      size={1}
      color="var(--canvas-grid)"
      className="!bg-bg"
    />
  );
});
