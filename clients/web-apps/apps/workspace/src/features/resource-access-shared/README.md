# Resource access shared

Dialog shell used by both access dialogs: `PickerShell`, `AccessPanelParts`, the `ModeCard`/`PolicySkeleton`/`ResourceMark` parts, `MARK_SHADOW`/`PANEL_TRANSITION` and the `AccessMode` type.

Both `features/resource-user-access` and `features/resource-flow-access` import from here. They never import each other, except that `resource-flow-access` may use the stable permission helpers in `resource-user-access` (`enums/`, `utils/resource-access-actions.ts`, `utils/resource-display.util.ts`, `utils/http-error.util.ts`).
