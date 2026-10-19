import { Building2, ShieldCheck, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { PANEL_TRANSITION } from "../../../constants/resource-flow-access.constant";
import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import type { AccessMode } from "../../../types/flow-access.type";
import { pluralize } from "../../../utils/pluralize.util";
import { getResourceTypeLabel } from "../../../utils/resource-display.util";
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
      <motion.div
        key="restricted"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={PANEL_TRANSITION}
        className="-mx-1 overflow-hidden px-1"
      >
        <div className="pb-1 pt-5">
          {draft.wasRestrictedEmpty && (
            <p className="mb-3 flex items-center gap-1.5 text-[12px] text-amber-700">
              <TriangleAlert className="size-3.5 shrink-0" />
              No agents can use this {getResourceTypeLabel(draft.resourceType)}. Save an empty list
              to open it to all agents.
            </p>
          )}
          <AgentPicker draft={draft} />
          {draft.wasOpenAccess && !draft.isOpenAccess && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-amber-700">
              <TriangleAlert className="size-3.5 shrink-0" />
              Agents not on this list lose access to this {getResourceTypeLabel(
                draft.resourceType,
              )}{" "}
              once you save.
            </p>
          )}

          <div className="mb-2 mt-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Allowed agents
              <span className="rounded-full bg-muted px-1.5 py-px text-[11px] tabular-nums tracking-normal text-slate-600">
                {draft.selectedIds.length}
              </span>
            </h3>
            {draft.selectedIds.length > 1 && (
              <button
                type="button"
                onClick={() => draft.replace([])}
                className="text-[12px] font-medium text-muted-foreground transition hover:text-rose-600"
              >
                Remove all
              </button>
            )}
          </div>

          {draft.rows.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-slate-50/50 px-6 py-8 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-popover text-indigo-500 shadow-sm ring-1 ring-border">
                <ShieldCheck className="size-5" />
              </span>
              <p className="mt-3 text-[13.5px] font-semibold text-slate-800">
                No agents allowed yet
              </p>
              <p className="mt-1 max-w-[18rem] text-[12.5px] leading-5 text-muted-foreground">
                Search above and pick the agents that should have access.
              </p>
            </div>
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
      </motion.div>
    ) : (
      <motion.div
        key="open"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={PANEL_TRANSITION}
        className="-mx-1 overflow-hidden px-1"
      >
        <div className="pb-1 pt-4">
          <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white px-4 py-3.5 ring-1 ring-emerald-600/10">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-popover text-emerald-600 shadow-sm ring-1 ring-emerald-600/15">
              <Building2 className="size-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-emerald-900">Open to every agent</p>
              <p className="mt-0.5 text-[12.5px] leading-5 text-emerald-900/65">
                Includes agents created later. Choose{" "}
                <span className="font-medium text-emerald-900">Selected agents</span> to limit
                access.
              </p>
            </div>
          </div>
          {!draft.wasOpenAccess && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-amber-700">
              <TriangleAlert className="size-3.5 shrink-0" />
              Saving clears the current list of {draft.saved.length} allowed{" "}
              {pluralize(draft.saved.length, "agent")}.
            </p>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
