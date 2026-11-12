import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";

import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

/**
 * Read-only agent name shown in the header outside the editable canvas.
 */
const AgentName = ({ className }: { className?: string }) => {
  const name = useReactFlowViewStore((state) => state.name);

  return (
    <Tooltip content={name}>
      <span
        className={cn(
          "min-w-0 max-w-80 truncate px-1.5 text-[15px] font-semibold leading-5 tracking-[-0.01em] text-ink",
          className,
        )}
      >
        {name}
      </span>
    </Tooltip>
  );
};

export default AgentName;
