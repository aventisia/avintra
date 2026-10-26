import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

import type { AccessMode } from "../../../../resource-access-shared/types/access-mode.type";
import { ResourceTypeEnum } from "../../../../resource-user-access/enums/resource-type-enum";
import { getResourceTypeLabel } from "../../../../resource-user-access/utils/resource-display.util";
import type { ResourceFlowDraft } from "../../../hooks/useResourceFlowDraft.hook";

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
    return <StatusLine tone="warning">Add at least one agent to restrict access</StatusLine>;
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
    <StatusLine tone={draft.isDirty ? "pending" : draft.isOpenAccess ? "open" : "idle"}>
      {text}
    </StatusLine>
  );
};
