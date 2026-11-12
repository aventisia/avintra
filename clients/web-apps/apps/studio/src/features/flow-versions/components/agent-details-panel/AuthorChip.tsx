import { FlowVersionDto } from "../../dtos/flow-version-dto";

/**
 * Initials bubble and name of the user who created a version.
 */
export const AuthorChip = ({ version }: { version: FlowVersionDto }) => (
  <span className="flex min-w-0 items-center gap-1.5">
    <span
      aria-hidden="true"
      className="grid size-[18px] shrink-0 place-items-center rounded-full bg-fill font-mono text-[8.5px] font-semibold uppercase text-ink-2 ring-1 ring-line"
    >
      {version.createdByUserInitials || "?"}
    </span>
    <span className="truncate">{version.createdByUsername || "Unknown user"}</span>
  </span>
);
