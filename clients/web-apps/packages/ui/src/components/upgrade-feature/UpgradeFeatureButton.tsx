import { LockClosedIcon } from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import { Button, type ButtonProps } from "@/ui/components/buttons";
import { Tooltip } from "@/ui/components/tooltip";

import { cn } from "../../lib";

type UpgradeFeatureButtonProps = {
  label: string;
  icon: ReactNode;
  /** Full title shown in the upgrade dialog. */
  title?: string;
  /** Full description shown in the upgrade dialog. */
  description?: string;
  pricingUrl: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  lockIconClassName?: string;
  openOnMount?: boolean;
};

export const UpgradeFeatureButton = ({
  label,
  icon,
  title = "Upgrade to unlock",
  description = "Upgrade now to access this feature and unlock more capabilities.",
  pricingUrl,
  size = "sm",
  variant = "outline",
  className,
  lockIconClassName,
  openOnMount = false,
}: UpgradeFeatureButtonProps) => {
  const [isOpen, setIsOpen] = useState(openOnMount);
  const [showPricingFallback, setShowPricingFallback] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setShowPricingFallback(false);
    setIsOpen(nextOpen);
  };

  const handleUpgrade = () => {
    try {
      const pricingWindow = window.open(pricingUrl, "_blank");

      if (pricingWindow) {
        pricingWindow.opener = null;
        setIsOpen(false);
        return;
      }
    } catch {
      setShowPricingFallback(true);
      return;
    }

    setShowPricingFallback(true);
  };

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
          <LockClosedIcon
            aria-hidden="true"
            className={cn("h-3.5 w-3.5 shrink-0", lockIconClassName)}
          />
        </Button>
      </Tooltip>

      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent className=" gap-5">
          <Button
            type="button"
            variant="ghost"
            size="icon8"
            className="absolute right-3 top-3"
            aria-label="Close upgrade dialog"
            onClick={() => setIsOpen(false)}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
          <AlertDialogHeader className="pr-7">
            <AlertDialogTitle className="break-words">{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          {showPricingFallback && (
            <p role="status" className="break-all text-sm text-muted-foreground">
              Pricing did not open. Visit{" "}
              <a href={pricingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {pricingUrl}
              </a>
              .
            </p>
          )}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <Button type="button" onClick={handleUpgrade}>
              Upgrade
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
