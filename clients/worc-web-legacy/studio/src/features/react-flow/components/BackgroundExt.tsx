import { Background, BackgroundVariant } from "@xyflow/react";

export const BackgroundExt = () => {
  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={15}
      size={1}
      className="!bg-slate-200"
    />
  );
};
