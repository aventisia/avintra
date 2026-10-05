import { UpgradeFeatureButton } from "@avplatform/ui";
import { PlusIcon } from "@heroicons/react/24/outline";

const UPGRADE_PRICING_URL = `${import.meta.env.VITE_MARKETING_URL}/pricing`;

/**
 * Spaces toolbar button for community deployments.
 *
 * Mirrors the shared DTCreateButton exactly (icon, size, styling, and label) so it sits
 * identically in the toolbar, but its action opens the upgrade dialog instead of the
 * create-space dialog.
 */
export const UpgradeSpaceButton = () => {
  return (
    <UpgradeFeatureButton
      label="Create Space"
      icon={<PlusIcon className="h-4 w-4" />}
      featureName="additional spaces"
      benefit="Create separate spaces to organize teams, users, and resources."
      pricingUrl={UPGRADE_PRICING_URL}
      size="xs"
      variant="default"
      className="gap-2 text-sm tracking-wide"
      openOnMount
    />
  );
};
