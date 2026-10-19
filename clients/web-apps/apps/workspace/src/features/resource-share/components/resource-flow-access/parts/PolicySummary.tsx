import { cn } from "@avplatform/ui/lib";
import { TriangleAlert } from "lucide-react";

import { ResourceTypeEnum } from "../../../enums/resource-type-enum";
import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";
import type { AccessMode } from "../../../types/flow-access.type";
import { pluralize } from "../../../utils/pluralize.util";
import { getResourceTypeLabel } from "../../../utils/resource-display.util";

type PolicySummaryProps = {
  draft: ResourceFlowDraft;
  mode: AccessMode;
  resourceType: ResourceTypeEnum | null;
};

/**
 * Footer line summarising the saved policy and the pending draft delta.
 */
export const PolicySummary = ({ draft, mode, resourceType }: PolicySummaryProps) => {
  const count = draft.selectedIds.length;

  if (draft.isLoading) return <span />;

  if (mode === "restricted" && count === 0) {
    return (
      <p className="flex min-w-0 items-center gap-2 text-[12.5px] font-medium text-amber-700">
        <TriangleAlert className="size-4 shrink-0" />
        <span className="truncate">Add at least one agent to restrict access</span>
      </p>
    );
  }

  const text = !draft.isDirty
    ? draft.wasOpenAccess
      ? "Open to every agent"
      : `Restricted to ${count} ${pluralize(count, "agent")}`
    : draft.isOpenAccess
      ? `Saving opens this ${getResourceTypeLabel(resourceType)} to every agent`
      : draft.wasOpenAccess
        ? `Saving limits to ${count} ${pluralize(count, "agent")}`
        : [
            draft.added.length > 0 && `${draft.added.length} added`,
            draft.removed.length > 0 && `${draft.removed.length} removed`,
          ]
            .filter(Boolean)
            .join(" · ");

  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-2 text-[12.5px]",
        draft.isDirty ? "font-medium text-slate-700" : "text-muted-foreground",
      )}
    >
      <span className="relative grid size-2 shrink-0 place-items-center">
        {draft.isDirty && (
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-60" />
        )}
        <span
          className={cn(
            "relative size-2 rounded-full",
            draft.isDirty ? "bg-primary" : draft.isOpenAccess ? "bg-emerald-500" : "bg-slate-400",
          )}
        />
      </span>
      <span className="truncate">{text}</span>
    </p>
  );
};
