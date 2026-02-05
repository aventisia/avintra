import { deploymentType } from "@/react-toolkit/types/user-session-types";
import { VisibilityRules } from "../types/visibility-type";

/**
 * Runtime environment flag
 */
const IS_PROD = import.meta.env.MODE === "production";

/**
 * Central visibility check for Action Categories and Actions.
 *
 * Rules:
 * - No visibility config -> visible everywhere
 * - showInProd:false hides only in production
 * - allowedDeploymentTypes restricts Commercial / Enterprise
 */
export const isVisible = (
  visibility: VisibilityRules | undefined,
  deploymentType: deploymentType,
): boolean => {
  // No rules -> visible everywhere
  if (!visibility) return true;

  // Production gating
  if (IS_PROD && visibility.showInProd === false) return false;

  // Deployment type gating
  if (
    visibility.allowedDeploymentTypes &&
    !visibility.allowedDeploymentTypes.includes(deploymentType)
  ) {
    return false;
  }

  return true;
};
