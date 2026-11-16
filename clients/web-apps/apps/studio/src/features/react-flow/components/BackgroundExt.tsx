import { Background, BackgroundVariant } from "@xyflow/react";
import { memo } from "react";

export const BackgroundExt = memo(() => {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={15}
      size={1}
      color="color-mix(in srgb, var(--line-strong) 85%, var(--bg))"
      className="!bg-bg"
    />
  );
});
