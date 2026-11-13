import { Background, BackgroundVariant } from "@xyflow/react";
import { memo } from "react";

export const BackgroundViewOnly = memo(() => {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={16}
      size={1}
      color="color-mix(in srgb, var(--line-strong) 55%, var(--bg))"
      className="!bg-bg"
    />
  );
});
