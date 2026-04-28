import { Background, BackgroundVariant } from "@xyflow/react";
import { memo } from "react";

export const BackgroundViewOnly = memo(() => {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={16}
      size={1}
      color="hsl(215.4 16.3% 46.9%)"
      className="!bg-slate-200 "
    />
  );
});
