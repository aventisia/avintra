# Resource flow access

Agent access for a resource: which flows and agents may use it. The row action opens `ResourceFlowAccessDialog`.

- Talks to the unchanged `/resource-flows` API (`apis/resource-flow-access.apis.ts`); nothing here is renamed from the flow side.
- Imports the dialog shell (`PickerShell`, `AccessPanelParts`, `ModeCard`, `PolicySkeleton`, `ResourceMark`, `MARK_SHADOW`, `PANEL_TRANSITION`, `AccessMode`) from `features/resource-access-shared`, and the stable permission helpers (`enums/`, `utils/resource-display.util.ts`, `utils/http-error.util.ts`) from `features/resource-user-access`. It is never imported by `resource-user-access`.
