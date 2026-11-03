import { PlusIcon } from "@heroicons/react/24/outline";

import { UpgradeFeatureButton } from "./UpgradeFeatureButton";

type UpgradeCreateButtonProps = {
  label: string;
  /** Full title shown in the upgrade dialog. */
  title?: string;
  /** Full description shown in the upgrade dialog. */
  description?: string;
} & (
  | {
      pricingUrl: string;
      /** In-app route to open instead of the external pricing page. */
      upgradePath?: string;
    }
  | {
      pricingUrl?: string;
      /** In-app route to open instead of the external pricing page. */
      upgradePath: string;
    }
);

/** Upgrade-gated create/invite toolbar button mirroring DTCreateButton styling. */
export const UpgradeCreateButton = ({
  label,
  title,
  description,
  pricingUrl,
  upgradePath,
}: UpgradeCreateButtonProps) => {
  return (
    <UpgradeFeatureButton
      label={label}
      icon={<PlusIcon className="h-4 w-4" />}
      title={title}
      description={description}
      pricingUrl={pricingUrl}
      upgradePath={upgradePath}
      size="xs"
      variant="default"
      className="gap-2 text-sm tracking-wide"
    />
  );
};
