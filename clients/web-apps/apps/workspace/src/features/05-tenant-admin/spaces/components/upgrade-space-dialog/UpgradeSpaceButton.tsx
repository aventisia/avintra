import { UpgradeFeatureButton } from "@avplatform/ui";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { PlusIcon } from "@heroicons/react/24/outline";

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL;
const UPGRADE_PRICING_URL = MARKETING_URL ? `${MARKETING_URL}/pricing` : undefined;

/**
 * Spaces toolbar button for community deployments and starter plans.
 *
 * Mirrors the shared DTCreateButton exactly (icon, size, styling, and label) so it sits
 * identically in the toolbar, but its action opens the upgrade dialog instead of the
 * create-space dialog.
 */
export const UpgradeSpaceButton = () => {
  const deploymentType = useUserSessionStore((state) => state.userSession?.deploymentType);
  const planType = useUserSessionStore((state) => state.userSession?.planType);
  const useTenantOverview = planType === "Starter" && deploymentType !== "Community";

  return (
    <UpgradeFeatureButton
      label="Create Space"
      icon={<PlusIcon className="h-4 w-4" />}
      pricingUrl={useTenantOverview ? undefined : UPGRADE_PRICING_URL}
      upgradePath={useTenantOverview ? "/tenant/overview" : undefined}
      size="xs"
      variant="default"
      className="gap-2 text-sm tracking-wide"
    />
  );
};
