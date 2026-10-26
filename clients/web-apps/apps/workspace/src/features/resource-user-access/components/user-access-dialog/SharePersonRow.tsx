import { cn } from "@avplatform/ui/lib";
import { Lock, Undo2, X } from "lucide-react";

import { PersonAvatar } from "@/components/PersonAvatar";

import { ResourceUserAccessDraft } from "../../hooks/useResourceUserAccessDraft.hook";
import { ShareChange, ShareRow } from "../../types/resource-user-access-draft.type";
import { getShareRoleLabel } from "../../utils/resource-user-access.util";
import { RoleMenu } from "./RoleMenu";

const CHANGE_BADGES: Partial<Record<ShareChange, { label: string; className: string }>> = {
  added: { label: "New", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15" },
  edited: { label: "Changed", className: "bg-amber-50 text-amber-700 ring-amber-600/15" },
  removed: { label: "Removing", className: "bg-rose-50 text-rose-600 ring-rose-600/15" },
};

/**
 * One person on the share list with their role and pending change.
 */
export const SharePersonRow = ({
  row,
  draft,
}: {
  row: ShareRow;
  draft: ResourceUserAccessDraft;
}) => {
  const isRemoved = row.change === "removed";
  const badge = CHANGE_BADGES[row.change];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3.5 py-2.5 transition-colors",
        isRemoved ? "bg-slate-50/80" : "hover:bg-slate-50/70",
      )}
    >
      <PersonAvatar
        name={row.person.name}
        className={cn("size-9 text-[12px] transition", isRemoved && "opacity-40 grayscale")}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-[13.5px] font-medium text-slate-900",
              isRemoved && "text-slate-400 line-through decoration-slate-300",
            )}
          >
            {row.person.name}
          </p>
          {row.isYou && (
            <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-px text-[10.5px] font-semibold text-slate-600 ring-1 ring-slate-900/[0.06]">
              You
            </span>
          )}
          {badge && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-semibold ring-1",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          )}
        </div>
        {row.person.email && row.person.email !== row.person.name && (
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{row.person.email}</p>
        )}
      </div>

      {isRemoved ? (
        <button
          type="button"
          onClick={() => draft.restoreRow(row)}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-popover px-2 text-[12px] font-medium text-slate-600 ring-1 ring-border transition hover:text-slate-900 hover:ring-slate-300"
        >
          <Undo2 className="size-3.5" />
          Undo
        </button>
      ) : row.isYou ? (
        <span
          aria-label={`Your access: ${getShareRoleLabel(row.role)}. You can’t change your own access.`}
          title="You can’t change your own access"
          className="inline-flex h-7 shrink-0 items-center gap-1 px-2 text-[12.5px] font-medium text-slate-400"
        >
          {draft.hasRoles ? getShareRoleLabel(row.role) : "You"}
          <Lock className="size-3.5 text-slate-300" aria-hidden />
        </span>
      ) : (
        <>
          {draft.hasRoles && (
            <RoleMenu
              role={row.role}
              personName={row.person.name}
              onChange={(role) => draft.setRole(row, role)}
            />
          )}
          <button
            type="button"
            aria-label={`Remove ${row.person.name}`}
            title={`Remove ${row.person.name}`}
            onClick={() => draft.removeRow(row)}
            className="-ml-1.5 grid size-7 shrink-0 place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <X className="size-4" />
          </button>
        </>
      )}
    </div>
  );
};
