import { deploymentType } from "@/react-toolkit/types/user-session-types";

export type VisibilityRules = {
  /** Should this appear in production? default = true */
  showInProd?: boolean;

  /** Which deployments can see this? default = allow all */
  allowedDeploymentTypes?: deploymentType[];
};
