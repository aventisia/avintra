# Resource share

Sharing for every shareable resource (queue, trigger, config store, vault credential, knowledge base, skill, tool, agent). The row action opens `ResourceShareDialog`, the card dialog from this feature.

- Changes stay in a draft (`useResourceShareDraft`) and are sent together on Save changes: the access mode (`PUT resource-share/tenant-access`), removals, role changes and additions (`POST resource-share/bulk`). A partial failure keeps the dialog open with only the changes the server did not accept.
- Specific people is the per-user share list. Everyone is the resource's tenant-wide flag and grants view access only; it does not keep the people list.
- Your own row is locked: you cannot remove yourself or change your own role.
- Spaces offer neither Everyone nor roles, because the backend tenant-wide switch does not support Space.
- Roles come from `SHARE_ROLES`; the values mirror `ResourceAccessTypeEnum`.
- The dialog and the agent access dialog share `PickerShell`, `AccessPanelParts`, `StatusLine`, `CardDialog` and `PersonAvatar`.
- Draft diffing and row ordering (you first, then role, then name) live in `utils/share-draft.util.ts`; the draft hook holds no DOM logic.
