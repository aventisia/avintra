# Resource user access

People access for every access-controlled resource (queue, trigger, config store, vault credential, knowledge base, skill, tool, agent). The row action opens `ResourceUserAccessDialog`, the card dialog from this feature.

- Changes stay in a draft (`useResourceUserAccessDraft`) and are sent together on Save changes: the access mode (`PUT resource-user-access/tenant-access`), removals, role changes and additions (`POST resource-user-access/bulk`). A partial failure keeps the dialog open with only the changes the server did not accept.
- Specific people is the per-user access list. Everyone is the resource's tenant-wide flag and grants view access only; it does not keep the people list.
- Your own row is locked: you cannot remove yourself or change your own role.
- Spaces offer neither Everyone nor roles, because the backend tenant-wide switch does not support Space.
- Roles come from `USER_ACCESS_ROLES`; the values mirror `ResourceAccessTypeEnum`.
- Dialog chrome shared with the agent access dialog (`PickerShell`, `AccessPanelParts`, `ModeCard`, `PolicySkeleton`, `ResourceMark`, `MARK_SHADOW`, `PANEL_TRANSITION`, `AccessMode`) lives in `features/resource-access-shared`, not here. Shared with the rest of the app are `StatusLine`, `CardDialog` and `PersonAvatar`.
- Draft diffing and row ordering (you first, then role, then name) live in `utils/resource-user-access.util.ts`; the draft hook holds no DOM logic.
- `enums/`, `utils/resource-access-actions.ts`, `utils/resource-display.util.ts` and `utils/http-error.util.ts` stay here as the shared permission helpers; `features/resource-flow-access` imports them one way, never the reverse.
