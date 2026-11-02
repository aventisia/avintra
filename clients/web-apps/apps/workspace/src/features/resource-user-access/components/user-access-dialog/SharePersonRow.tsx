import { Badge, type BadgeProps } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";
import { Lock, Trash2, Undo2 } from "lucide-react";

import { PersonAvatar } from "@/components/PersonAvatar";

import { ResourceUserAccessDraft } from "../../hooks/useResourceUserAccessDraft.hook";
import { ShareChange, ShareRow } from "../../types/resource-user-access-draft.type";
import { getShareRoleLabel } from "../../utils/resource-user-access.util";
import { RoleMenu } from "./RoleMenu";

const CHANGE_BADGES: Partial<
  Record<ShareChange, { label: string; variant: BadgeProps["variant"] }>
> = {
  added: { label: "New", variant: "default" },
  edited: { label: "Changed", variant: "review" },
  removed: { label: "Removing", variant: "destructive" },
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
        isRemoved ? "bg-sunken" : "hover:bg-hover",
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
              "truncate text-[13.5px] font-medium text-ink",
              isRemoved && "text-muted-foreground line-through decoration-line-strong",
            )}
          >
            {row.person.name}
          </p>
          {row.isYou && (
            <Badge variant="secondary" className="shrink-0">
              You
            </Badge>
          )}
          {badge && (
            <Badge variant={badge.variant} className="shrink-0">
              {badge.label}
            </Badge>
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
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-surface px-2 text-[12px] font-medium text-ink-2 ring-1 ring-line-strong transition hover:text-ink hover:ring-line-strong"
        >
          <Undo2 className="size-3.5" />
          Undo
        </button>
      ) : row.isYou ? (
        <span
          aria-label={`Your access: ${getShareRoleLabel(row.role)}. You can’t change your own access.`}
          title="You can’t change your own access"
          className="inline-flex h-7 shrink-0 items-center gap-1 px-2 text-[12.5px] font-medium text-muted-foreground"
        >
          {draft.hasRoles ? getShareRoleLabel(row.role) : "You"}
          <Lock className="size-3.5 text-muted-foreground" aria-hidden />
        </span>
      ) : draft.hasRoles ? (
        <RoleMenu
          role={row.role}
          personName={row.person.name}
          onChange={(role) => draft.setRole(row, role)}
          onRemove={() => draft.removeRow(row)}
        />
      ) : (
        <button
          type="button"
          aria-label={`Remove ${row.person.name}`}
          title={`Remove ${row.person.name}`}
          onClick={() => draft.removeRow(row)}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
};
