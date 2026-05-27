import { DeploymentType } from "@aventisia/ui/types";
import { DoNotRenderIfType } from "../types/do-not-render-type";

/**
 * Runtime environment flag
 */
const IS_PROD = import.meta.env.MODE === "production";

/**
 * Determines whether an action should be visible based on deployment conditions and rendering rules.
 *
 * @param doNotRenderIf - Array of conditions under which the action should not be rendered.
 *                        Can include "production", "commercial", or "enterprise".
 * @param deploymentType - The type of deployment environment ("Commercial" or "Enterprise").
 *
 * @returns `true` if the action should be visible, `false` otherwise.
 *
 * @remarks
 * The visibility logic follows this precedence:
 * 1. If no rendering rules are specified, the action is visible everywhere
 * 2. If in production and "production" is in the exclusion list, hide the action
 * 3. If deployment type matches an excluded type ("commercial" or "enterprise"), hide the action
 * 4. Otherwise, show the action
 *
 * @example
 * ```typescript
 * // Action hidden in production
 * canWeRenderNodeOrCategory(["production"], "Commercial"); // false in prod, true otherwise
 *
 * // Action hidden for commercial deployments
 * canWeRenderNodeOrCategory(["commercial"], "Commercial"); // false
 *
 * // Action always visible
 * canWeRenderNodeOrCategory(undefined, "Enterprise"); // true
 * ```
 */
export const canWeRenderNodeOrCategory = (
  doNotRenderIf: DoNotRenderIfType | undefined,
  deploymentType: DeploymentType,
): boolean => {
  // No rules -> visible everywhere
  if (!doNotRenderIf) return true;

  // Production gating
  if (IS_PROD && doNotRenderIf.includes("production")) return false;

  // Deployment type gating
  if (
    (doNotRenderIf.includes("commercial") && deploymentType === "Commercial") ||
    (doNotRenderIf.includes("enterprise") && deploymentType === "Enterprise")
  ) {
    return false;
  }

  return true;
};
