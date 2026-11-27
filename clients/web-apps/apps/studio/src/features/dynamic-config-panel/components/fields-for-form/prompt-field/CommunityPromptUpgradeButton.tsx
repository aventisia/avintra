import { UpgradeFeatureButton } from "@avplatform/ui";
import { SparkleIcon } from "@phosphor-icons/react";

type CommunityPromptUpgradeButtonProps = {
  label: string;
};

/** Upgrade call-to-action shown in place of a prompt action on the Community edition. */
const CommunityPromptUpgradeButton = ({ label }: CommunityPromptUpgradeButtonProps) => {
  return (
    <UpgradeFeatureButton
      label={label}
      icon={<SparkleIcon className="h-4 w-4" />}
      pricingUrl={`${import.meta.env.VITE_MARKETING_URL}/pricing`}
      className="flex w-36 items-center gap-2 rounded-full border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
    />
  );
};

export { CommunityPromptUpgradeButton };
