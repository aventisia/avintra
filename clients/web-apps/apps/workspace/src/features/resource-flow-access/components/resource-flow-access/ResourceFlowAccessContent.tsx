import { DialogPrimitive } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { Info, LoaderCircle, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

import { ModeCard } from "../../../resource-access-shared/components/parts/ModeCard";
import { PolicySkeleton } from "../../../resource-access-shared/components/parts/PolicySkeleton";
import { ResourceMark } from "../../../resource-access-shared/components/parts/ResourceMark";
import { MARK_SHADOW } from "../../../resource-access-shared/constants/access-ui.constant";
import { getResourceDisplayName } from "../../../resource-user-access/utils/resource-display.util";
import { useFlowAccessMode } from "../../hooks/useFlowAccessMode.hook";
import type { ResourceFlowDraft } from "../../hooks/useResourceFlowDraft.hook";
import { AccessPanels } from "./parts/AccessPanels";
import { PolicySummary } from "./parts/PolicySummary";

/**
 * Agent access editor for a resource. The open/restricted decision comes first and the
 * allow-list only appears once access is restricted.
 */
export const ResourceFlowAccessContent = ({ draft }: { draft: ResourceFlowDraft }) => {
  const resourceName = getResourceDisplayName(draft.resourceName, draft.resourceType);
  const { mode, chooseMode, canSave, handleModeKeyDown } = useFlowAccessMode(draft);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (draft.isLoading || cardRef.current?.contains(document.activeElement)) return;
    cardRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [draft.isLoading]);

  return (
    <motion.section
      ref={cardRef}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.16 }}
      className="relative flex max-h-[calc(100dvh_-_max(4.5rem,12vh)_-_1rem)] w-[min(35rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[20px] bg-popover text-slate-900 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.4)] ring-1 ring-slate-900/[0.06]"
    >
      <header className="flex items-start gap-4 px-6 pb-4 pt-6">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-slate-50",
            MARK_SHADOW,
          )}
        >
          <ResourceMark resourceType={draft.resourceType} className="size-6" />
        </span>
        <div className="min-w-0 flex-1 mt-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            Agent access
          </p>
          <DialogPrimitive.Title className="truncate text-[18px] font-semibold tracking-[-0.01em] text-slate-900">
            {resourceName}
          </DialogPrimitive.Title>
        </div>
        <DialogPrimitive.Close
          aria-label="Close"
          className="-mr-2 -mt-1 grid size-8 place-items-center rounded-lg text-slate-400 outline-none transition hover:bg-muted hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-1">
        {draft.isLoading ? (
          <PolicySkeleton />
        ) : (
          <>
            <div
              role="radiogroup"
              aria-label={`Which agents can use ${resourceName}`}
              onKeyDown={handleModeKeyDown}
              className="grid grid-cols-2 gap-3"
            >
              <ModeCard
                mode="open"
                isChecked={mode === "open"}
                title="Any agent"
                description="Open to every agent in this workspace."
                onSelect={chooseMode}
                autoFocusTarget={mode === "open"}
              />
              <ModeCard
                mode="restricted"
                isChecked={mode === "restricted"}
                title="Selected agents"
                description="Limited to the agents you pick."
                onSelect={chooseMode}
              />
            </div>

            <AccessPanels draft={draft} mode={mode} />

            <p className="mt-5 flex gap-2 text-[12px] leading-5 text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
              Access applies to every version of an agent, including ones created and published
              later.
            </p>
          </>
        )}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-3.5">
        <PolicySummary draft={draft} mode={mode} resourceType={draft.resourceType} />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={draft.close}
            className="h-9 rounded-lg px-3.5 text-[13px] font-medium text-slate-600 outline-none transition hover:bg-border/60 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={draft.save}
            disabled={!canSave}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(67,56,202,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] outline-none transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:bg-border disabled:text-slate-400 disabled:shadow-none"
          >
            {draft.isSaving && <LoaderCircle className="size-4 animate-spin" />}
            {draft.isSaving ? "Saving" : "Save changes"}
          </button>
        </div>
      </footer>
    </motion.section>
  );
};
