import { Info } from "lucide-react";

import { WarningLine } from "../../../resource-access-shared/components/AccessPanelParts";
import { LinkedShareCandidateDto } from "../../dtos/resource-user-access.dto";
import { ResourceUserAccessDraft } from "../../hooks/useResourceUserAccessDraft.hook";

const LinkedItemRow = ({
  candidate,
  status,
}: {
  candidate: LinkedShareCandidateDto;
  status: string | null;
}) => (
  <li className="flex items-center justify-between gap-3 px-3.5 py-2">
    <span className="truncate text-[13px] text-slate-800">{candidate.name}</span>
    {status && <span className="shrink-0 text-[12px] text-muted-foreground">{status}</span>}
  </li>
);

const LinkedItemList = ({
  candidates,
  shareItems,
}: {
  candidates: LinkedShareCandidateDto[];
  shareItems?: boolean;
}) => (
  <ul className="mt-1 divide-y divide-slate-100">
    {candidates.map((candidate) => (
      <LinkedItemRow
        key={`${candidate.resourceType}-${candidate.resourceId}`}
        candidate={candidate}
        status={
          shareItems === undefined
            ? null
            : candidate.canShare
              ? shareItems
                ? "Can view"
                : "Not shared"
              : `Ask the owner to share${candidate.ownerName ? ` — ${candidate.ownerName}` : ""}`
        }
      />
    ))}
  </ul>
);

const GroupHeading = ({ label }: { label: string }) => (
  <p className="px-3.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
    {label}
  </p>
);

type LinkedItemsSectionProps = {
  draft: ResourceUserAccessDraft;
};

/**
 * Linked items the agent uses: what saving shares at Can view, what needs its owner, and the
 * Everyone-mode list of items that stay closed.
 */
export const LinkedItemsSection = ({ draft }: LinkedItemsSectionProps) => {
  const linked = draft.linkedItems;

  if (!linked.isVisible || linked.isLoading) return null;

  if (linked.isError) {
    return (
      <div className="mt-5">
        <WarningLine>
          Couldn’t load the items this agent uses. Only the agent will be shared.
        </WarningLine>
      </div>
    );
  }

  if (draft.isOpenAccess) {
    return (
      <div className="mt-5 overflow-hidden rounded-xl bg-popover ring-1 ring-border">
        <p className="px-3.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Linked items stay as they are
        </p>
        <p className="px-3.5 pt-1 text-[12px] leading-5 text-muted-foreground">
          Everyone on the agent doesn’t open these items. Share each one separately.
        </p>
        <LinkedItemList candidates={linked.openAccessRows} />
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-popover ring-1 ring-border">
      <label className="flex cursor-pointer items-start gap-3 px-3.5 py-3">
        <input
          type="checkbox"
          checked={linked.shareItems}
          onChange={(event) => linked.setShareItems(event.target.checked)}
          className="mt-0.5 size-4 accent-indigo-600"
        />
        <span>
          <span className="block text-[13px] font-semibold text-slate-900">
            Also share these items
          </span>
          <span className="mt-0.5 block text-[12px] leading-5 text-muted-foreground">
            The agent can’t run without them. Each one is shared at Can view.
          </span>
        </span>
      </label>

      {linked.credentials.length > 0 && (
        <div className="border-t border-slate-100">
          <GroupHeading label="Credentials" />
          <p className="flex gap-1.5 px-3.5 pt-1 text-[12px] leading-5 text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
            Can view on a credential lets people open it and see its values (secrets).
          </p>
          <LinkedItemList candidates={linked.credentials} shareItems={linked.shareItems} />
        </div>
      )}

      {linked.groups.map((group) => (
        <div key={group.label} className="border-t border-slate-100">
          <GroupHeading label={group.label} />
          <LinkedItemList candidates={group.rows} shareItems={linked.shareItems} />
        </div>
      ))}

      {!linked.shareItems && (
        <p className="border-t border-slate-100 px-3.5 py-2.5 text-[12px] text-amber-700">
          Only the agent will be shared.
        </p>
      )}
    </div>
  );
};
