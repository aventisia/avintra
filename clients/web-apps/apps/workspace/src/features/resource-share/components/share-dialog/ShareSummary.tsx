import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

import { ResourceShareDraft } from "../../hooks/useResourceShareDraft.hook";

type ShareSummaryProps = {
  draft: ResourceShareDraft;
  spaceName: string;
};

/**
 * Footer line summarising the saved sharing and the pending draft delta.
 */
export const ShareSummary = ({ draft, spaceName }: ShareSummaryProps) => {
  if (draft.isLoading || draft.isError) return <span />;
  if (draft.saveError) return <StatusLine tone="error">{draft.saveError}</StatusLine>;

  if (!draft.isDirty) {
    const count = draft.rows.length;
    return (
      <StatusLine tone={draft.isOpenAccess ? "open" : "idle"}>
        {draft.isOpenAccess
          ? `Everyone in ${spaceName} can view`
          : `${count} ${pluralize(count, "person", "people")} with access`}
      </StatusLine>
    );
  }

  const text = draft.isModeChanged
    ? draft.isOpenAccess
      ? `Saving opens it to everyone in ${spaceName}`
      : "Saving limits it to the people listed"
    : [
        draft.added.length > 0 && `${draft.added.length} added`,
        draft.edited.length > 0 && `${draft.edited.length} changed`,
        draft.removed.length > 0 && `${draft.removed.length} removed`,
      ]
        .filter(Boolean)
        .join(" · ");

  return <StatusLine tone="pending">{text}</StatusLine>;
};
