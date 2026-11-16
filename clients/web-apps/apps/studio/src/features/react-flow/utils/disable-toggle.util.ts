import { STRUCTURAL_NODE_TYPES } from "../constants/structural-node-types.constant";

/** Returns true when the node type can be enabled or disabled. */
export const isTogglableType = (type?: string): boolean =>
  !STRUCTURAL_NODE_TYPES.includes(type ?? "");

/**
 * Resolves which node ids a canvas action targets: the right-clicked node alone
 * when it sits outside the canvas selection, otherwise the canvas selection.
 */
export const resolveTargetIds = (canvasIds: string[], rightClickedId?: string): string[] =>
  rightClickedId && !canvasIds.includes(rightClickedId) ? [rightClickedId] : canvasIds;

/** Returns true when at least one target is currently enabled. */
export const shouldDisableTargets = (
  targetIds: string[],
  isDisabled: (id: string) => boolean,
): boolean => targetIds.some((id) => !isDisabled(id));
