import { SHARE_ROLES } from "../constants/share-roles.constant";
import { ResourceShareDto } from "../dtos/resource-share.dto";
import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";
import { ShareInvite, SharePerson, ShareRow } from "../types/share-draft.type";

type ShareDraftState = {
  saved: ResourceShareDto[];
  invites: ShareInvite[];
  roleEdits: Record<string, ResourceAccessTypeEnum>;
  removedIds: string[];
  myEmail: string;
};

const toSharePerson = (share: ResourceShareDto): SharePerson => {
  const email = share.username ?? "";
  const name = [share.firstName, share.lastName].filter(Boolean).join(" ");
  return { userId: share.userId, name: name || email || "Unknown user", email };
};

const getRoleRank = (role: ResourceAccessTypeEnum) =>
  SHARE_ROLES.findIndex(({ value }) => value === role);

/**
 * Label of a sharing role, falling back to the access level label for roles no longer offered.
 */
export const getShareRoleLabel = (role: ResourceAccessTypeEnum) =>
  SHARE_ROLES.find(({ value }) => value === role)?.label ??
  role.replace(/([a-z])([A-Z])/g, "$1 $2");

const isMyShare = (share: ResourceShareDto, myEmail: string) =>
  Boolean(myEmail) && share.username?.toLowerCase() === myEmail;

/**
 * Compares a sharing draft with the saved shares. Changes the server already holds drop out,
 * so after a partial save only the failed ones stay pending.
 */
export const getShareDraftChanges = ({
  saved,
  invites,
  roleEdits,
  removedIds,
  myEmail,
}: ShareDraftState) => {
  const savedUserIds = new Set(saved.map((share) => share.userId));
  const removedSet = new Set(removedIds);

  const added = invites.filter(({ person }) => !savedUserIds.has(person.userId));
  const removed = saved.filter((share) => removedSet.has(share.id));
  const edited = saved.filter(
    (share) =>
      !removedSet.has(share.id) &&
      roleEdits[share.id] !== undefined &&
      roleEdits[share.id] !== share.accessLevel,
  );
  const editedSet = new Set(edited.map((share) => share.id));

  const savedRows = [...saved]
    .sort(
      (first, second) =>
        Number(isMyShare(second, myEmail)) - Number(isMyShare(first, myEmail)) ||
        getRoleRank(second.accessLevel) - getRoleRank(first.accessLevel) ||
        toSharePerson(first).name.localeCompare(toSharePerson(second).name),
    )
    .map((share): ShareRow => ({
      key: share.id,
      person: toSharePerson(share),
      role: roleEdits[share.id] ?? share.accessLevel,
      change: removedSet.has(share.id) ? "removed" : editedSet.has(share.id) ? "edited" : "kept",
      isYou: isMyShare(share, myEmail),
      share,
    }));

  const addedRows = added
    .map(({ person, role }): ShareRow => ({
      key: `invite-${person.userId}`,
      person,
      role,
      change: "added",
      isYou: false,
    }))
    .reverse();

  return { added, edited, removed, rows: [...addedRows, ...savedRows] };
};
