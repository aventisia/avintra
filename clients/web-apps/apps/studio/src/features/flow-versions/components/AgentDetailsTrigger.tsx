import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { CaretDownIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { AGENT_DETAILS_PANEL_ID } from "../constants";
import { useUpdateCurrentAgent } from "../hooks/useUpdateCurrentAgent.hook";
import { useFlowsVersionsStore } from "../stores/flow-versions-store";
import { AgentNameField } from "./AgentNameField";
import { SaveStatusIndicator } from "./SaveStatusIndicator";

const PILL_CLASS = "flex min-w-0 max-w-80 items-center gap-1 rounded-md py-0.5 pl-0.5 pr-1";
const NAME_CLASS = "text-[15px] font-semibold leading-6 tracking-[-0.01em] text-ink";
const TOGGLE_CLASS =
  "flex size-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28] disabled:cursor-wait";

/**
 * Agent name and version in the header. The name stays editable whether the details panel is
 * open or not; only the caret toggles the panel.
 */
export const AgentDetailsTrigger = () => {
  const isVersionTransitioning = useCurrentFlowStore((state) => state.isVersionTransitioning);
  const versionNumber = useFlowsVersionsStore((state) => state.versionNumber);
  const { save, status: renameStatus } = useUpdateCurrentAgent();
  const { isOpen, openPanel, closePanel } = usePanelStore(
    useShallow((state) => ({
      isOpen: !!state.panels[AGENT_DETAILS_PANEL_ID]?.isOpen,
      openPanel: state.openPanel,
      closePanel: state.closePanel,
    })),
  );

  const toggle = () => {
    if (isOpen) closePanel(AGENT_DETAILS_PANEL_ID);
    else openPanel(AGENT_DETAILS_PANEL_ID, "left");
  };

  const versionChip =
    versionNumber != null ? (
      <span className="shrink-0 font-mono text-[11px] leading-4 text-muted-foreground">
        v{versionNumber}
      </span>
    ) : null;

  return (
    <div className={PILL_CLASS}>
      <AgentNameField className={NAME_CLASS} onRename={(newName) => save({ name: newName })} />
      {versionChip}
      <Tooltip content={isOpen ? "Close details" : "Agent details and versions"}>
        <button
          type="button"
          aria-label={isOpen ? "Close agent details" : "Open agent details"}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          disabled={isVersionTransitioning}
          onClick={toggle}
          className={TOGGLE_CLASS}
        >
          {isVersionTransitioning ? (
            <CircleNotchIcon className="size-3 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <>
              {renameStatus === "idle" ? (
                <CaretDownIcon
                  className={cn(
                    "size-3 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              ) : null}
              <SaveStatusIndicator status={renameStatus} />
            </>
          )}
        </button>
      </Tooltip>
    </div>
  );
};
