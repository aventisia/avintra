import { ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { pluralize } from "@/utils/pluralize.util";

import { PANEL_TRANSITION } from "../../../constants/resource-flow-access.constant";
import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import type { AccessMode } from "../../../types/flow-access.type";
import { getResourceTypeLabel } from "../../../utils/resource-display.util";
import {
  AccessEmptyState,
  AnimatedPanel,
  OpenAccessCallout,
  PanelHeading,
  WarningLine,
} from "../../AccessPanelParts";
import { AgentPicker } from "./AgentPicker";
import { AllowListRow } from "./AllowListRow";

type AccessPanelsProps = {
  draft: ResourceFlowDraft;
  mode: AccessMode;
};

/**
 * Animated restricted/open panels below the mode radio group.
 */
export const AccessPanels = ({ draft, mode }: AccessPanelsProps) => (
  <AnimatePresence initial={false} mode="wait">
    {mode === "restricted" ? (
      <AnimatedPanel key="restricted">
        <div className="pb-1 pt-5">
          {draft.wasRestrictedEmpty && (
            <WarningLine className="mb-3">
              No agents can use this {getResourceTypeLabel(draft.resourceType)}. Save an empty list
              to open it to all agents.
            </WarningLine>
          )}
          <AgentPicker draft={draft} />
          {draft.wasOpenAccess && !draft.isOpenAccess && (
            <WarningLine>
              Agents not on this list lose access to this {getResourceTypeLabel(draft.resourceType)}{" "}
              once you save.
            </WarningLine>
          )}

          <PanelHeading
            title="Allowed agents"
            count={draft.selectedIds.length}
            action={
              draft.selectedIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => draft.replace([])}
                  className="text-[12px] font-medium text-muted-foreground transition hover:text-rose-600"
                >
                  Remove all
                </button>
              )
            }
          />

          {draft.rows.length === 0 ? (
            <AccessEmptyState
              icon={ShieldCheck}
              title="No agents allowed yet"
              description="Search above and pick the agents that should have access."
            />
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-popover ring-1 ring-border/90">
              <AnimatePresence initial={false}>
                {draft.rows.map(({ agent, change }) => (
                  <motion.li
                    key={agent.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={PANEL_TRANSITION}
                    className="overflow-hidden"
                  >
                    <AllowListRow agent={agent} change={change} draft={draft} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </AnimatedPanel>
    ) : (
      <AnimatedPanel key="open">
        <div className="pb-1 pt-4">
          <OpenAccessCallout
            title="Open to every agent"
            description={
              <>
                Includes agents created later. Choose{" "}
                <span className="font-medium text-emerald-900">Selected agents</span> to limit
                access.
              </>
            }
          />
          {!draft.wasOpenAccess && (
            <WarningLine>
              Saving clears the current list of {draft.saved.length} allowed{" "}
              {pluralize(draft.saved.length, "agent")}.
            </WarningLine>
          )}
        </div>
      </AnimatedPanel>
    )}
  </AnimatePresence>
);
