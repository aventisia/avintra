import { LockIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

import { Button, type ButtonProps } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";

import { cn } from "../../lib";
import { UpgradeDialog } from "./UpgradeDialog";

type UpgradeFeatureButtonProps = {
  label: string;
  icon: ReactNode;
  /** Full title shown in the upgrade dialog. */
  title?: string;
  /** Full description shown in the upgrade dialog. */
  description?: string;
  pricingUrl?: string;
  upgradePath?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  lockIconClassName?: string;
};

export const UpgradeFeatureButton = ({
  label,
  icon,
  title,
  description,
  pricingUrl,
  upgradePath,
  size = "sm",
  variant = "outline",
  className,
  lockIconClassName,
}: UpgradeFeatureButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip content="Available with an upgrade">
        <Button
          type="button"
          size={size}
          variant={variant}
          className={className}
          aria-label={`${label}. Available with an upgrade.`}
          onClick={() => setIsOpen(true)}
        >
          <span aria-hidden="true" className="flex shrink-0 items-center">
            {icon}
          </span>
          <span>{label}</span>
          <LockIcon aria-hidden="true" className={cn("h-3.5 w-3.5 shrink-0", lockIconClassName)} />
        </Button>
      </Tooltip>

      <UpgradeDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        description={description}
        pricingUrl={pricingUrl}
        upgradePath={upgradePath}
      />
    </>
  );
};
