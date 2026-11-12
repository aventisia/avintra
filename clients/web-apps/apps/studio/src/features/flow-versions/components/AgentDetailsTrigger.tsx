import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CaretDownIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { AGENT_DETAILS_PANEL_ID } from "../constants";
import { useFlowsVersionsStore } from "../stores/flow-versions-store";

/**
 * Agent name and version in the header; toggles the agent details panel.
 */
export const AgentDetailsTrigger = () => {
  const name = useCurrentFlowStore((state) => state.currentFlow.name);
  const isVersionTransitioning = useCurrentFlowStore((state) => state.isVersionTransitioning);
  const versionNumber = useFlowsVersionsStore((state) => state.versionNumber);
  const { isOpen, openPanel, closePanel } = usePanelStore(
    useShallow((state) => ({
      isOpen: !!state.panels[AGENT_DETAILS_PANEL_ID]?.isOpen,
      openPanel: state.openPanel,
      closePanel: state.closePanel,
    })),
  );

  return (
    <Tooltip content="Agent details and versions">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={isVersionTransitioning}
        onClick={() =>
          isOpen ? closePanel(AGENT_DETAILS_PANEL_ID) : openPanel(AGENT_DETAILS_PANEL_ID, "left")
        }
        className={cn(
          "group flex min-w-0 max-w-80 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left transition-colors",
          "hover:bg-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] aria-expanded:bg-hover disabled:cursor-wait",
        )}
      >
        <span className="min-w-0 truncate text-[15px] font-semibold leading-5 tracking-[-0.01em] text-ink">
          {name}
        </span>
        {versionNumber != null ? (
          <span className="shrink-0 rounded px-1 font-mono text-[11px] leading-4 text-muted-foreground ring-1 ring-inset ring-line">
            v{versionNumber}
          </span>
        ) : null}
        {isVersionTransitioning ? (
          <CircleNotchIcon className="size-3 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <CaretDownIcon className="size-3 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" />
        )}
      </button>
    </Tooltip>
  );
};
