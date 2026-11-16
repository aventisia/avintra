import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useShallow } from "zustand/react/shallow";

import {
  AGENT_NAME_CLASS,
  AGENT_TITLE_CLASS,
  AGENT_VERSION_CLASS,
} from "@/features/flow-versions/constants";
import { useReactFlowViewStore } from "@/stores/react-flow-view-store";

/**
 * Read-only agent name and version shown in the header outside the editable canvas, styled to
 * match the canvas title so switching views keeps the header steady.
 */
const AgentName = ({ className }: { className?: string }) => {
  const { name, versionNumber } = useReactFlowViewStore(
    useShallow((state) => ({ name: state.name, versionNumber: state.versionNumber })),
  );

  return (
    <div className={AGENT_TITLE_CLASS}>
      <Tooltip content={name}>
        <span className={cn("min-w-0 truncate px-1", AGENT_NAME_CLASS, className)}>{name}</span>
      </Tooltip>
      {versionNumber ? <span className={AGENT_VERSION_CLASS}>v{versionNumber}</span> : null}
    </div>
  );
};

export default AgentName;
