import type { DeploymentType } from "@avplatform/ui/types";

import { getAvailableCredits } from "@/features/available-credits/available-credits-apis.ee";

export const getExecutionEntitlementError = async (
  deploymentType: DeploymentType | undefined,
  planType: string | undefined,
): Promise<string | null> => {
  if (deploymentType === "Commercial") {
    const creditsData = await getAvailableCredits();
    if (creditsData?.data && creditsData.data.availableCredits < 10) {
      return "Insufficient credits. Please top up to continue.";
    }
  }

  if (deploymentType === "Enterprise" && planType !== "Active") {
    return "This action is currently unavailable. Please contact your administrator or support.";
  }

  return null;
};
