import { PersonAvatar } from "@avplatform/ui/avatar";

import { FlowVersionDto } from "../../dtos/flow-version-dto";

/**
 * Tinted initials avatar and name of the user who created a version, matching the workspace's
 * avatars. Shows the email address as the hover title.
 */
export const AuthorChip = ({ version }: { version: FlowVersionDto }) => {
  const knownName = version.createdBy?.trim() || version.createdByUsername;

  return (
    <span
      className="flex min-w-0 items-center gap-1.5"
      title={version.createdByUsername ?? knownName}
    >
      {knownName ? <PersonAvatar name={knownName} size="sm" /> : null}
      <span className="truncate">{knownName || "Unknown user"}</span>
    </span>
  );
};
